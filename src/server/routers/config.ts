import { GameType } from '@/data/check-code';
import { CheckNickName } from '@/lib/check-nickname';
import { publicProcedure, router } from '@/server/trpc';
import { configWeb } from '@/types/schema/config_web';
import { WebsiteConfig } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const ConfigWeb = router({
  upsert: publicProcedure.input(configWeb).mutation(async ({ ctx, input }) => {
    try {
      console.log(input);
      // Check if a record exists
      const existingConfig = await ctx.prisma.websiteConfig.findFirst();

      if (existingConfig) {
        // If record exists, update it
        return ctx.prisma.websiteConfig.update({
          where: {
            id: existingConfig.id,
          },
          data: {
            ...input,
          },
        });
      } else {
        // If no record exists, create a new one
        return ctx.prisma.websiteConfig.create({
          data: {
            ...input,
          },
        });
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        console.error(error.message);
      }
      throw error;
    }
  }),

  // Get the current config
  getConfig: publicProcedure.query(async ({ ctx }) => {
    try {
      const config = await ctx.prisma.websiteConfig.findFirst();
      if (!config) {
        return null; // Return null if no config exists yet
      }
      return config;
    } catch (error) {
      if (error instanceof TRPCError) {
        console.error(error.message);
      }
      throw error;
    }
  }),
  checkNickName: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        serverId: z.string().optional(),
        type: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await CheckNickName({
          type: (input.type as GameType) ?? '',
          userId: input.userId ?? '',
          serverId: input.serverId,
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          console.error(error.message);
        }
        throw error;
      }
    }),
    getSetting :  publicProcedure.query(async({ctx})  => {
      try {
        const data =  await ctx.prisma.websiteConfig.findFirst() 
           if(!data){
            return null
           }
          return {
            data : data,
            status : true,
            statusCode : 200,
            message  : "config retreived successfully",
          }
      } catch (error) {
       throw new Error("config not found")
      }
    })
});
