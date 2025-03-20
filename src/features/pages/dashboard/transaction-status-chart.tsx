"use client"

import { useTheme } from "next-themes"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { trpc } from "@/utils/trpc"
import { Skeleton } from "@/components/ui/skeleton"
import { FormatPrice } from "@/utils/formatPrice"

export function TransactionStatusChart() {
  const { theme } = useTheme()
  const { data, isLoading } = trpc.transaction.getTransactionStats.useQuery()

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (!data || !data.statusDistribution) {
    return <div className="flex h-[300px] items-center justify-center">No data available</div>
  }

  // Filter out statuses with 0 count to avoid empty segments
  const chartData = data.statusDistribution.filter((item) => item.count > 0)

  // Define colors for each status
  const statusColors = {
    PENDING: "#FFA500", // Orange
    PAID: "#3498db", // Blue
    PROCCESS: "#9b59b6", // Purple
    SUCCESS: "#2ecc71", // Green
    FAILED: "#e74c3c", // Red
  }

  // Map status names to more readable labels
  const statusLabels = {
    PENDING: "PENDING",
    PAID: "PAID",
    PROCCESS: "PROCCESS",
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
  }

  // Format data for the chart
  const formattedData = chartData.map((item) => ({
    name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
    value: item.count,
    amount: item.amount,
    percentage: item.percentage.toFixed(1),
  }))



  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            labelLine={true}
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={statusColors[entry.name as keyof typeof statusColors] || "#999999"}
                stroke={theme === "dark" ? "#1e293b" : "#f8fafc"}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => {
              if (name === "value") {
                return [`${value} transactions`, "Count"]
              }
              return [FormatPrice(props.payload.amount), "Amount"]
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

