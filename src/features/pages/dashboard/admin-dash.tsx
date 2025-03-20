"use client"
import { ChangeEvent, useState } from "react"
import { CreditCard, DollarSign, Download, Filter, Search, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DataTable } from "./data-table"
import { DateRangePicker } from "./data-range-picker"
import { TransactionStatusChart } from "./transaction-status-chart"
import { RevenueChart } from "./revenue-chart"
import { RecentTransactions } from "./recent-transactions"
import { trpc } from "@/utils/trpc"
import { FormatPrice } from "@/utils/formatPrice"
import {  type DateRange } from "react-day-picker"
import { format, toZonedTime } from "date-fns-tz"
import { GrowthIndicator } from "@/components/ui/growth-payment"
import { ButtonExport, ButtonExportTransactionStats } from "@/data/export/button-export"
import { TransactionDashboardData } from "@/types/dashboard"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
export type FILTER = "ALL" | "PAYMENT" | "DEPOSIT" | "Top Up" 
export default function DashboardAdminPage() {
  const convertToWIB = (date: Date) => {
    const jakartaTimeZone = "Asia/Jakarta"
    const wibDate = toZonedTime(date, jakartaTimeZone)
    return format(wibDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", {
      timeZone: jakartaTimeZone,
    })
  }

  const [dateRange, setDateRange] = useState<DateRange  | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  const { data, isLoading } = trpc.transaction.getTransactionStats.useQuery({
    startDate: dateRange?.from ? convertToWIB(dateRange.from) : undefined,
    endDate: dateRange?.to ? convertToWIB(dateRange.to) : undefined,
  })

  const { data: recentTransactions } = trpc.transaction.getRecentTransactions.useQuery({ limit: 10 })

  return (
    <main className="flex flex-col gap-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <h1 className=" text-2xl font-bold text-foreground">Transaction Dashboard</h1>
        <div className="flex  items-center gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button className="px-2 bg-card text-white text-sm border-blue-900 border">
          Export
        </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col gap-1">
          <ButtonExportTransactionStats data={data as TransactionDashboardData}/>
            <ButtonExport data={recentTransactions as []}/>
        </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? "Loading..." : data?.totalTransactions || 0}
            </div>
            {!isLoading && data?.growth && <GrowthIndicator value={data.growth.transactions} />}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold ">
              {isLoading ? "Loading..." : FormatPrice(data?.totalRevenue || 0)}
            </div>
            {!isLoading && data?.growth && <GrowthIndicator value={data.growth.revenue} />}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Success Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? "Loading..." : `${data?.successRate.toFixed(1)}%` || "0%"}
            </div>
            {!isLoading && data?.growth && <GrowthIndicator value={data.growth.successRate} />}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? "Loading..." : data?.activeUsers || 0}
            </div>
            {!isLoading && data?.growth && <GrowthIndicator value={data.growth.activeUsers} />}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Transaction Status</CardTitle>
            <CardDescription className="text-muted-foreground">Distribution of transaction statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionStatusChart />
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Revenue Trend</CardTitle>
            <CardDescription className="text-muted-foreground">Daily revenue for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views - Updated to include all 5 statuses */}
      <Tabs defaultValue="all" className="w-full">
      <div className="flex items-center justify-between">
          <TabsList className="bg-muted  md:flex hidden">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="PAID">Paid</TabsTrigger>
            <TabsTrigger value="PROCESS">Processing</TabsTrigger>
            <TabsTrigger value="SUCCESS">Success</TabsTrigger>
            <TabsTrigger value="FAILED">Failed</TabsTrigger>
          </TabsList>
          {
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex md:hidden bg-background mr-2">Filter</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="">
              <TabsList className="bg-muted flex md:hidden">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="PAID">Paid</TabsTrigger>
            <TabsTrigger value="PROCESS">Processing</TabsTrigger>
            <TabsTrigger value="SUCCESS">Success</TabsTrigger>
            <TabsTrigger value="FAILED">Failed</TabsTrigger>
          </TabsList>
              </DropdownMenuContent>
            </DropdownMenu>
          }
         {/* <ResponsiveSearchAndFilter 
          onChange={(term)  => setSearch(term)}
          searchQuery={search}
          setSortOption={(e)  => setSortOption(e as FILTER)}
          sort={sortOption}
         /> */}
        </div>

        <TabsContent value="all" className="mt-4">
          <DataTable />
        </TabsContent>
        <TabsContent value="PENDING" className="mt-4">
          <DataTable status="PENDING" />
        </TabsContent>
        <TabsContent value="PAID" className="mt-4">
          <DataTable status="PAID" />
        </TabsContent>
        <TabsContent value="PROCESS" className="mt-4">
          <DataTable status="PROCESS" />
        </TabsContent>
        <TabsContent value="SUCCESS" className="mt-4">
          <DataTable status="SUCCESS" />
        </TabsContent>
        <TabsContent value="FAILED" className="mt-4">
          <DataTable status="FAILED" />
        </TabsContent>
      </Tabs>

      {/* Recent Transactions */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Transactions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Latest 10 transactions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions && (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <RecentTransactions transaction={transaction} key={transaction.id} />
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link  href={'/dashboard/pesanan'} className="w-full flex justify-center items-center">
          <Button variant="outline" >
            View All Transactions
          </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}

