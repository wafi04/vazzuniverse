import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { toZonedTime } from 'date-fns-tz';
import { Prisma } from '@prisma/client';
import { orderSchema } from '@/types/schema/order';
import { TRPCError } from '@trpc/server';

export const transaction = router({
  getTransaction: publicProcedure
    .input(
      z.object({
        merchantOrderId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.prisma.transaction.findUnique({
        where: {
          merchantOrderId: input.merchantOrderId,
        },
        include: {
          invoice: true,
          pembelian: true,
        },
      });

      if (!data) {
        throw new Error('transaction not found');
      }
      const category = await ctx.prisma.categories.findFirst({
        where: {
          kode: data.pembelian[0].game,
        },
      });
      const res = {
        data,
        category,
      };

      return res;
    }),

    getCalculatedTransaction: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const statusMap: Record<string, string> = {
        PAID: 'PAID',
        FAILED: 'FAILED',
        PENDING: 'PENDING',
        SUCCESS: 'SUCCESS',
        PROCESS: 'PROCESS', // Perbaikan typo di sini
      };
      
      console.log("Status yang diterima:", input.status);
      const paymentStatus = input.status ? statusMap[input.status] : undefined;
      console.log("Status yang digunakan untuk query:", paymentStatus);
      
      // Tambahkan pengurutan berdasarkan tanggal terbaru
      return await ctx.prisma.transaction.findMany({
        where: paymentStatus
          ? {
              paymentStatus,
            }
          : {},
        include: {
          invoice: true,
        },
        orderBy: {
          createdAt: 'desc', // Mengurutkan dari terbaru ke terlama
        },
      });
    }),
  getTransactionAll: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        page: z.number().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit = 10, page = 1, status, search } = input;

      // Simplified pagination calculation
      const take = limit;
      const skip = (page - 1) * take;
      // Build dynamic where clause
      const where: Prisma.TransactionWhereInput = {};

      if (status) {
        where.paymentStatus = status;
      }

      if (search) {
        where.OR = [
          { merchantOrderId: { contains: search } },
          { noWa: { contains: search } },
        ];
      }

      // Fetch transactions from the database
      const transactions = await ctx.prisma.transaction.findMany({
        where,
        include: {
          invoice: true,

          user: {
            select: {
              id: true,
              name: true,
              username: true,
              whatsapp: true,
            },
          },
        },

        take,
        skip,
        orderBy: {
          createdAt: 'desc', // Order by creation date (newest first)
        },
      });

      // Optionally, fetch total count for pagination
      const totalCount = await ctx.prisma.transaction.count({ where });

      return {
        transactions,
        totalCount,
      };
    }),
  getRecentTransactions: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        type: z.enum(['ALL', 'PAYMENT', 'DEPOSIT', 'Top Up']).optional(),
        filter : z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.type && input.type !== 'ALL' ? { transactionType: input.type } : {}),
  
        ...(input.filter
          ? {
              OR: [
                { merchantOrderId: { contains: input.filter ?? input.type } },
                { paymentMethod: { contains: input.filter ?? input.type } }, 
                { pembelian: { some: { username: { contains: input.filter  || input.type} } } }, 
              ],
            }
          : {}),
      };


      const data = await ctx.prisma.transaction.findMany({
        where,
        take: input.limit ?? 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          pembelian: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              whatsapp: true,
            },
          },
        },
      });


      console.log(data)

      return data.map((transaction) => ({
        ...transaction,
      }));
    }),
    getTransactionStats : publicProcedure
    .input(
      z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          paymentStatus: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const parseDate = (dateString: string) => {
        if (!dateString) return null
        const jakartaTimeZone = "Asia/Jakarta"
        const wibDate = new Date(dateString)
        const utcDate = toZonedTime(wibDate, jakartaTimeZone)
        if (isNaN(utcDate.getTime())) {
          throw new Error("Invalid date")
        }
        return utcDate
      }
  
      const endDate = parseDate(input?.endDate as string) || new Date()
      const startDate = parseDate(input?.startDate as string) || new Date(new Date().setDate(endDate.getDate() - 30))
  
      console.log("Parsed dates:", { startDate, endDate })
      console.log("Using date range:", { startDate, endDate })
  
      // Previous period for comparison (same duration, immediately before)
      const prevPeriodDuration = endDate.getTime() - startDate.getTime()
      const prevPeriodEndDate = new Date(startDate)
      const prevPeriodStartDate = new Date(startDate.getTime() - prevPeriodDuration)
  
      const where = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(input?.paymentStatus && {
          paymentStatus: input.paymentStatus,
        }),
      }
  
      console.log("Where clause:", where)
      const prevPeriodWhere = {
        createdAt: {
          gte: prevPeriodStartDate,
          lte: prevPeriodEndDate,
        },
        ...(input?.paymentStatus && {
          paymentStatus: input.paymentStatus,
        }),
      }
  
      // Get total count of transactions - current period
      const totalTransactions = await ctx.prisma.transaction.count({ where })
  
      // Get total count of transactions - previous period
      const prevPeriodTotalTransactions = await ctx.prisma.transaction.count({
        where: prevPeriodWhere,
      })
  
      // Calculate growth percentage for transactions
      const transactionGrowth =
        prevPeriodTotalTransactions > 0
          ? ((totalTransactions - prevPeriodTotalTransactions) / prevPeriodTotalTransactions) * 100
          : 0
  
      // Get revenue data - current period (only count successful transactions)
      const revenueData = await ctx.prisma.transaction.aggregate({
        where: {
          ...where,
          paymentStatus: "SUCCESS", // Changed from 'PAID' to 'success'
        },
        _sum: {
          finalAmount: true,
        },
      })
  
      // Get revenue data - previous period (only count successful transactions)
      const prevPeriodRevenueData = await ctx.prisma.transaction.aggregate({
        where: {
          ...prevPeriodWhere,
          paymentStatus: "SUCCESS", // Changed from 'PAID' to 'success'
        },
        _sum: {
          finalAmount: true,
        },
      })
  
      // Calculate growth percentage for revenue
      const currentRevenue = revenueData._sum.finalAmount || 0
      const prevRevenue = prevPeriodRevenueData._sum.finalAmount || 0
      const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0
  
      // Get success rate (successful transactions / total transactions)
      // Now counting transactions with 'success' status
      const successfulTransactions = await ctx.prisma.transaction.count({
        where: {
          ...where,
          paymentStatus: "SUCCESS", // Changed from 'PAID' to 'success'
        },
      })
  
      const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0
  
      // Get previous period success rate
      const prevSuccessfulTransactions = await ctx.prisma.transaction.count({
        where: {
          ...prevPeriodWhere,
          paymentStatus: "SUCCESS", // Changed from 'PAID' to 'success'
        },
      })
  
      const prevSuccessRate =
        prevPeriodTotalTransactions > 0 ? (prevSuccessfulTransactions / prevPeriodTotalTransactions) * 100 : 0
  
      // Calculate growth percentage for success rate
      const successRateGrowth = prevSuccessRate > 0 ? ((successRate - prevSuccessRate) / prevSuccessRate) * 100 : 0
  
      // Get unique active users in current period
      const activeUsers = await ctx.prisma.transaction.groupBy({
        by: ["userId"],
        where,
        _count: {
          id: true,
        },
      })
  
      // Get unique active users in previous period
      const prevActiveUsers = await ctx.prisma.transaction.groupBy({
        by: ["userId"],
        where: prevPeriodWhere,
        _count: {
          id: true,
        },
      })
  
      // Calculate growth percentage for active users
      const activeUsersCount = activeUsers.length
      const prevActiveUsersCount = prevActiveUsers.length
      const activeUsersGrowth =
        prevActiveUsersCount > 0 ? ((activeUsersCount - prevActiveUsersCount) / prevActiveUsersCount) * 100 : 0
  
      // Get transactions by status for charts - now will include all 5 statuses
      const transactionsByStatus = await ctx.prisma.transaction.groupBy({
        by: ["paymentStatus"],
        where,
        _count: {
          id: true,
        },
        _sum: {
          finalAmount: true,
        },
      })
  
      // Ensure all 5 statuses are represented in the results
      const allStatuses = ["PENDING", "PAID", "PROCESS", "SUCCESS", "FAILED"]
      const formattedTransactionsByStatus = allStatuses.map((status) => {
        const found = transactionsByStatus.find((t) => t.paymentStatus === status)
        return {
          status,
          count: found ? found._count.id : 0,
          amount: found && found._sum.finalAmount ? found._sum.finalAmount : 0,
        }
      })
  
      // Get recent transactions for the table
      const recentTransactions = await ctx.prisma.transaction.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          pembelian: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      })
  
      // Get daily transaction data for time series chart
      // Updated to include all statuses in the query
      const today = new Date()
      const last30Days = new Date(today)
      last30Days.setDate(today.getDate() - 30)
      const dailyTransactions = await ctx.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::text as count,
        SUM(CASE WHEN payment_status = 'SUCCESS' THEN final_amount ELSE 0 END)::text as revenue,
        SUM(CASE WHEN payment_status = 'PENDING' THEN 1 ELSE 0 END)::text as pending_count,
        SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END)::text as paid_count,
        SUM(CASE WHEN payment_status = 'PROCESS' THEN 1 ELSE 0 END)::text as process_count,
        SUM(CASE WHEN payment_status = 'SUCCESS' THEN 1 ELSE 0 END)::text as success_count,
        SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END)::text as failed_count
      FROM transactions
      WHERE created_at >= ${last30Days} AND created_at <= ${today}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
  
      // Calculate status distribution percentages
      const statusDistribution = formattedTransactionsByStatus.map((status) => ({
        ...status,
        percentage: totalTransactions > 0 ? (status.count / totalTransactions) * 100 : 0,
      }))
  
      return {
        totalTransactions,
        totalRevenue: currentRevenue,
        successRate,
        activeUsers: activeUsersCount,
        growth: {
          transactions: Number.parseFloat(transactionGrowth.toFixed(1)),
          revenue: Number.parseFloat(revenueGrowth.toFixed(1)),
          successRate: Number.parseFloat(successRateGrowth.toFixed(1)),
          activeUsers: Number.parseFloat(activeUsersGrowth.toFixed(1)),
        },
        transactionsByStatus: formattedTransactionsByStatus,
        statusDistribution,
        recentTransactions,
        dailyTransactions,
      }
    }),
  create: publicProcedure.input(orderSchema).query(async ({ ctx, input }) => {
    try {
      const data = await ctx.prisma.transaction.create({
        data: {
          ...input,
        },
      });

      return {
        data,
        status: true,
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        console.error(error);
        return {
          status: false,
          mesage: `failed to create transaction ${error.message}`,
          statusCode: 400,
        };
      }
      return {
        status: false,
        message: 'Internal Server Error',
        statusCode: 500,
      };
    }
  }),
});
