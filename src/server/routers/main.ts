import { Prisma } from '@prisma/client';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { FormCategory } from '@/types/schema/categories';
export const mainRouter = router({
  getBanners: publicProcedure.query(async ({ ctx }) => {
    try {
      const banners = await ctx.prisma.berita.findMany();
      return {
        statusCode: 200,
        message: 'Banners fetched successfully',
        data: banners,
      };
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw new Error('Failed to fetch banners');
    }
  }),
  createCategory: publicProcedure
    .input(FormCategory)
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.categories.create({
        data: {
          ...input,
        },
      });

      return {
        message: 'success',
        status: true,
        data: category,
      };
    }),

  updateCategory: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: FormCategory.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.categories.update({
        where: { id: input.id },
        data: input.data,
      });

      return {
        message: 'success',
        status: true,
        data: category,
      };
    }),

  deleteCategory: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.categories.delete({
        where: { id: input.id },
      });

      return {
        message: 'success',
        status: true,
      };
    }),
  getCategoriesByName: publicProcedure
    .input(
      z.object({
        kode: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const categories = await ctx.prisma.categories.findFirst({
          where: {
            kode: input.kode,
            status: 'active',
          },
        });

        const subCategories = await ctx.prisma.subCategories.findMany({
          where: {
            categoriesId: categories?.id,
          },
        });

        return { categories, subCategories };
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        throw new Error('Failed to fetch  categories');
      }
    }),
  getCategoriesType: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.categories.findMany({
        select: {
          type: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      throw new Error('Failed to fetch  categories');
    }
  }),
  getCategoriesActive: publicProcedure
    .input(
      z.object({
        type: z.string(),
        page: z.string().transform((val) => parseInt(val, 10) || 1),
        perPage: z.string().transform((val) => parseInt(val, 10) || 10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const skip = (input.page - 1) * input.perPage;

        // Get paginated data
        const categories = await ctx.prisma.categories.findMany({
          where: { type: input.type, status: 'active' },
          skip,
          take: input.perPage,
          orderBy: { id: 'asc' },
        });

        const totalCount = await ctx.prisma.categories.count({
          where: { type: input.type },
        });

        const totalPages = Math.ceil(totalCount / input.perPage);

        return {
          data: categories,
          meta: {
            currentPage: input.page,
            perPage: input.perPage,
            totalCount,
            totalPages,
            hasNextPage: input.page < totalPages,
            hasPreviousPage: input.page > 1,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        throw new Error('Failed to fetch active categories');
      }
    }),
  getCategoriesAll: publicProcedure
    .input(
      z.object({
        type: z.string().optional(),
        status: z.string().optional(),
        page: z.number().optional(),
        perPage: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { perPage = 10, page = 1, type, status, search } = input;

      // Simplified pagination calculation
      const take = perPage;
      const skip = (page - 1) * take;

      // Build dynamic where clause
      const where: Prisma.CategoriesWhereInput = {};

      // Add type filter if provided
      if (type) {
        where.type = type;
      }

      // Add status filter if provided
      if (status) {
        where.status = status;
      }

      // Add search filter if provided
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { subName: { contains: search } },
          { brand: { contains: search } },
          { kode: { contains: search } },
        ];
      }

      try {
        // Get categories with pagination and filters
        const [categories, totalCount] = await Promise.all([
          ctx.prisma.categories.findMany({
            where,
            take,
            skip,
            orderBy: {
              createdAt: 'desc',
            },
          }),
          ctx.prisma.categories.count({ where }),
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / take);

        return {
          data: categories,
          pagination: {
            page,
            perPage,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
        throw new Error('Failed to fetch categories');
      }
    }),
  getCategoriesPopular: publicProcedure.query(async ({ ctx }) => {
    try {
      const categories = await ctx.prisma.categories.findMany({
        where: {
          type: 'populer',
          status: 'active',
        },
      });
      return categories;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      throw new Error('failed to fetch categories popular');
    }
  }),
  getCategories: publicProcedure
    .input(
      z
        .object({
          fields: z.array(z.string()).optional(), // Optional array of fields to select
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      try {
        // Determine which fields to select
        const selectedFields = input?.fields?.length
          ? input.fields.reduce((acc, field) => {
              acc[field] = true;
              return acc;
            }, {} as Record<string, boolean>)
          : undefined;

        // Fetch categories with conditional selection
        const categories = await ctx.prisma.categories.findMany({
          select: selectedFields || undefined, // Use selected fields or fetch all
        });

        return {
          statusCode: 200,
          message: 'Categories fetched successfully',
          data: categories,
        };
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }
    }),
    findLeaderboards: publicProcedure
    .query(async ({ ctx }) => {
      const today = new Date();
      
      // Calculate start dates for different timeframes
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
      // Get leaderboards for all timeframes in parallel
      const [dailyLeaderboard, weeklyLeaderboard, monthlyLeaderboard] = await Promise.all([
        // Daily leaderboard
        ctx.prisma.transaction.groupBy({
          by: ["userId"],
          _sum: {
            finalAmount: true
          },
          where: {
            paymentStatus: 'PAID',
            userId: { not: null },
            createdAt: {
              gte: startOfDay,
              lte: today
            }
          },
          orderBy: {
            _sum: {
              finalAmount: 'desc'
            }
          },
          take: 10
        }),
        
        // Weekly leaderboard
        ctx.prisma.transaction.groupBy({
          by: ["userId"],
          _sum: {
            finalAmount: true
          },
          where: {
            paymentStatus: 'PAID',
            userId: { not: null },
            createdAt: {
              gte: startOfWeek,
              lte: today
            }
          },
          orderBy: {
            _sum: {
              finalAmount: 'desc'
            }
          },
          take: 10
        }),
        
        // Monthly leaderboard
        ctx.prisma.transaction.groupBy({
          by: ["userId"],
          _sum: {
            finalAmount: true
          },
          where: {
            paymentStatus: 'PAID',
            userId: { not: null },
            createdAt: {
              gte: startOfMonth,
              lte: today
            }
          },
          orderBy: {
            _sum: {
              finalAmount: 'desc'
            }
          },
          take: 10
        })
      ]);
  
      // Get unique user IDs from all leaderboards
      const userIds = new Set<string>();
      [...dailyLeaderboard, ...weeklyLeaderboard, ...monthlyLeaderboard].forEach(item => {
        if (item.userId) userIds.add(item.userId as string);
      });
  
      // Fetch user details for all users in one query
      const users = await ctx.prisma.users.findMany({
        where: {
          id: { in: Array.from(userIds) }
        },
        select: {
          id: true,
          username: true,
        }
      });
  
      // Create a map for quick user lookup
      const userMap = new Map();
      users.forEach(user => {
        userMap.set(user.id, user);
      });
  
      // Format leaderboard data with user details
      const formatLeaderboardData = (leaderboardData: any[]) => {
        return leaderboardData.map((item, index) => ({
          position: index + 1,
          userId: item.userId,
          totalAmount: item._sum.finalAmount,
          user: userMap.get(item.userId)
        }));
      };
  
      return {
        daily: formatLeaderboardData(dailyLeaderboard),
        weekly: formatLeaderboardData(weeklyLeaderboard),
        monthly: formatLeaderboardData(monthlyLeaderboard)
      };
    }),
    findMostTransactions: publicProcedure.query(async({ctx}) => {
      // First, get the top users by transaction count
      const topUsers = await ctx.prisma.transaction.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
        _sum: {
          finalAmount: true
        },
        where: {
          paymentStatus: 'PAID',
          userId: { not: null },
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      });
      
      // Now fetch user details for each user in the top list
      const usersWithDetails = await Promise.all(
        topUsers.map(async (userStats) => {
          const user = await ctx.prisma.users.findUnique({
            where: { id: userStats.userId as string },
            select: {
              id: true,
              name: true,
              username : true,
              whatsapp : true,
            }
          });
          
          return {
            ...userStats,
            user: user
          };
        })
      );
      
      return usersWithDetails;
    })
});
