import { z } from "zod";
import { publicProcedure, router } from "../trpc";



export const invoiceRouter = router({
  findById: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Fetch the invoice from the database
        const invoice = await ctx.prisma.invoices.findUnique({
          where: {
            invoiceNumber : input.id, // Use `id` directly in the `where` clause
          },
         select : {
            id : true,
            invoiceNumber: true,
            totalAmount : true,
            transaction : {
                select : {
                    paymentStatus : true,
                    noWa : true,
                }
                
            }
         }
        });

        // If no invoice is found, return a clear message
        if (!invoice) {
          return {
            status: false,
            message: "Invoice not found",
            data: null,
          };
        }

        // Return the invoice data with a success message
        return {
          status: true,
          message: "Invoice found successfully",
          data: invoice,
        };
      } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching invoice:", error);

        // Return a generic error message to the client
        return {
          status: false,
          message: "An unexpected error occurred while fetching the invoice",
          data: null,
        };
      }
    }),
});