"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { FormatPrice } from "@/utils/formatPrice"
import { format } from "date-fns"

interface RecentTransactionsProps {
  transaction: any
}

export function RecentTransactions({ transaction }: RecentTransactionsProps) {
  const statusColors: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    PAID: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    PROCESS: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    SUCCESS: "bg-green-100 text-green-800 hover:bg-green-100",
    FAILED :  "bg-red-100 text-red-800 hover:bg-red-100",
  }

  const status = transaction.paymentStatus.toLowerCase()
  const userName = transaction.user?.name || "Guest"
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={transaction.user?.image || ""} alt={userName} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{userName}</div>
          <div className="text-sm text-muted-foreground">{transaction.merchantOrderId}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium">{FormatPrice(transaction.finalAmount)}</div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(transaction.createdAt), "dd MMM yyyy, HH:mm")}
          </div>
        </div>
        <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
    </div>
  )
}

