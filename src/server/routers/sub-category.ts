import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { Prisma } from '@prisma/client';
import { FormSubCategory } from '@/types/schema/categories';
import { TRPCError } from '@trpc/server';

export const subCategory = router({
  getCategories: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.categories.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),
  getSubAll: publicProcedure
    .input(
      z.object({
        page: z.number(),
        perPage: z.number(),
        search: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search } = input;
      const take = perPage;
      const skip = (page - 1) * take;
      // Build dynamic where clause
      const where: Prisma.SubCategoriesWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { code: { contains: search } },
        ];
      }
      const data = await ctx.prisma.subCategories.findMany({
        where,
        take,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
      });
      const totalCount = await ctx.prisma.subCategories.count({
        where,
      });
      const totalPages = Math.ceil(totalCount / take);

      return {
        data,
        pagination: {
          page,
          perPage,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }),
  createCategories: publicProcedure
    .input(FormSubCategory)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.subCategories.create({
          data: {
            ...input,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(`erorr create sub category ${error.message}`);
        }
        throw error;
      }
    }),
  updateSub: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: FormSubCategory.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.subCategories.update({
          where: {
            id: input.id,
          },
          data: {
            ...input.data,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(`erorr update sub category ${error.message}`);
        }
        throw error;
      }
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.subCategories.delete({
          where: {
            id: input.id,
          },
        });
        return { success: true, message: 'delete successfully' };
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(`erorr update sub category ${error.message}`);
        }
        throw error;
      }
    }),
});
