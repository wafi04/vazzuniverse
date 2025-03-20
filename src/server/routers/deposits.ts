import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { auth } from '../../../auth';
import { findUserById} from '@/app/(auth)/_components/api';

export const Deposits = router({
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        perPage: z.number().default(10),
        search: z.string().optional().default(''),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.DepositsWhereInput = {};
        const take = input.perPage;
        const skip = (input.page - 1) * take;

        if (input.search) {
          where.username = {
            contains: input.search,
          };
        }

        const totalCount = await ctx.prisma.deposits.count({
          where,
        });

        const totalPages = Math.ceil(totalCount / take);
        const hasNextPage = input.page < totalPages;
        const hasPreviousPage = input.page > 1;

        const data = await ctx.prisma.deposits.findMany({
          where,
          take,
          skip,
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          data,
          pagination: {
            totalCount,
            totalPages,
            currentPage: input.page,
            hasNextPage,
            hasPreviousPage,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error('error : ', error.message);
        }
        throw new Error(`Internal Server Erorr`);
      }
    }),
    getByUsername: publicProcedure.query(async ({ ctx }) => {
      try {
        const session = await auth();
        if (!session?.user?.id) {
          return {
            status: false,
            message: 'Unauthorized',
            statusCode: 401,
            data: [] // Add empty data array for consistency
          };
        }
        
        const user = await findUserById(session.user.id as string);
        
        if (!user?.username) {
          return {
            status: false,
            message: 'User not found or username not set',
            statusCode: 404,
            data: []
          };
        }
        
        const data = await ctx.prisma.deposits.findMany({
          where: {
            username: user.username
          },
          orderBy: {
            createdAt : 'desc'
          }
        });
        
        return {
          data : {
            deposit : data,
            user : user
          },
          status: true,
          statusCode: 200,
          message: 'Deposits retrieved successfully'
        };
      } catch (error) {
        console.error('Error in getByUsername:', error);
        
        if (error instanceof TRPCError) {
          return {
            status: false,
            message: error.message,
            statusCode: 400,
            data: []
          };
        }
        
        return {
          status: false,
          message: 'Internal Server Error',
          statusCode: 500,
          data: []
        };
      }
    })
});
