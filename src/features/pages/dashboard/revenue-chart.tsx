'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { trpc } from '@/utils/trpc';
import { Skeleton } from '@/components/ui/skeleton';

interface TypeTransaction {
  count: string;
  date: string;

  failed_count: string;
  paid_count: string;
  pending_count: string;
  process_count: string;

  revenue: string;
  success_count: string;
}

export function RevenueChart() {
  const { data, isLoading } = trpc.transaction.getTransactionStats.useQuery();

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!data || !data.dailyTransactions || data.dailyTransactions.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        No data available
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.dailyTransactions.map((item: TypeTransaction) => {
    const date = new Date(item.date);
    return {
      date: date.toISOString().split('T')[0],
      revenue: parseFloat(item.revenue || '0'),
      PENDING: parseInt(item.pending_count || '0'),
      PAID: parseInt(item.paid_count || '0'),
      PROCESS: parseInt(item.process_count || '0'),
      SUCCESS: parseInt(item.success_count || '0'),
      FAILED: parseInt(item.failed_count || '0'),
    };
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}  
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(79, 156, 249, 0.1)"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#8ecae6' }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.getDate().toString();
            }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#8ecae6' }}
            tickFormatter={(value) => {
              return new Intl.NumberFormat('id-ID', {
                notation: 'compact',
                compactDisplay: 'short',
                style: 'currency',
                currency: 'IDR',
              }).format(value);
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#8ecae6' }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'revenue') {
                return [
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(value as number),
                  'Revenue',
                ];
              }
              return [value, name];
            }}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }}
            contentStyle={{
              backgroundColor: '#001f54',
              borderColor: 'rgba(79, 156, 249, 0.2)',
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend />

          {/* Revenue Area */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#4f9cf9"
            fill="rgba(79, 156, 249, 0.2)"
          />

          {/* Transaction Status Areas */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="SUCCESS"
            name="Success"
            stroke="#2ecc71"
            fill="rgba(46, 204, 113, 0.2)"
            stackId="status"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="PROCESS"
            name="Processing"
            stroke="#9b59b6"
            fill="rgba(155, 89, 182, 0.2)"
            stackId="status"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="PAID"
            name="Paid"
            stroke="#3498db"
            fill="rgba(52, 152, 219, 0.2)"
            stackId="status"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="PENDING"
            name="Pending"
            stroke="#FFA500"
            fill="rgba(255, 165, 0, 0.2)"
            stackId="status"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="FAILED"
            name="Failed"
            stroke="#e74c3c"
            fill="rgba(231, 76, 60, 0.2)"
            stackId="status"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
