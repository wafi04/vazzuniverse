import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Parse the callback data from Digiflazz
    const callbackData = await req.json();
    console.log('Digiflazz callback received:', JSON.stringify(callbackData));

    // Extract required parameters
    const {
      ref_id,
      buyer_sku_code,
      customer_no,
      status,
      message,
      sn,
    } = callbackData.data;

    
    const referenceId = ref_id;
    console.log('Processing reference ID:', referenceId);

    // Validate required parameters
    if (!referenceId || !buyer_sku_code || !customer_no) {
      console.log('Missing required parameters');
      return NextResponse.json({
        data: {
          status: "2",
          message: "Terdapat parameter yang kosong",
          rc: "07"
        }
      });
    }

    // Map Digiflazz status to your application status - using trim and case insensitive comparison
    const normalizedStatus = status ? status.trim().toLowerCase() : '';
    console.log('Original status:', status);
    console.log('Normalized status:', normalizedStatus);
    
    // Simplified status mapping - only SUCCESS or FAILED
    const purchaseStatus = normalizedStatus === 'sukses' ? 'SUCCESS' : 'FAILED';
    
    console.log('Mapped purchase status:', purchaseStatus);

    // Use a transaction for all database operations to ensure consistency
    return await prisma.$transaction(async (tx) => {
      // Find existing pembelian by ref_id
      console.log('Looking for pembelian with ref_id:', referenceId);
      let pembelian = await tx.pembelian.findFirst({
        where: { ref_id: referenceId }
      });

      console.log('Initial pembelian lookup result:', pembelian ? 'Found' : 'Not found');

      // If not found with exact match and we have a DEPOSIT reference format, try to find by transaction reference
      if (!pembelian && referenceId.startsWith('DEPOSIT-')) {
        console.log('Looking for transaction with paymentReference:', referenceId);
        const transaction = await tx.transaction.findFirst({
          where: { paymentReference: referenceId }
        });



        console.log('Transaction lookup result:', transaction ? 'Found' : 'Not found');
        
        if (transaction) {
          // Find pembelian linked to this transaction
          console.log('Looking for pembelian with transaction_id:', transaction.id);
          pembelian = await tx.pembelian.findFirst({
            where: { transaction_id: transaction.id }
          });

          console.log('Pembelian from transaction lookup:', pembelian ? 'Found' : 'Not found');
        }
      
      } else if (!pembelian  && referenceId.startsWith("MANUAL-")){
        const transaction = await tx.transaction.findFirst({
          where: { paymentReference: referenceId }
        });
        await tx.transaction.update({
          where  : {
            id : transaction?.id
          },
          data  : {
            paymentStatus: purchaseStatus,
            statusMessage: message || "",
            paymentReference: referenceId,
            completedAt : new Date(),
          }
        })
        return NextResponse.json({
          data: {
            ref_id: referenceId,
            status: "1", // Return success status code
            price: transaction?.finalAmount,
            message: "Success",
            tr_id: transaction?.id,
            rc: "00"
          }
        });
      }

      // If pembelian exists, update it and related records
      if (pembelian) {
        console.log('Found pembelian to update:', pembelian.order_id);
        
        // Map your status to Digiflazz expected response
        const statusCode = purchaseStatus === 'SUCCESS' ? "1" : "2";
        const rc = purchaseStatus === 'SUCCESS' ? "00" : "06";
        const statusMessage = purchaseStatus === 'SUCCESS' ? "Success" : "Gagal";

        // Skip update if status is already SUCCESS and we're trying to set it to FAILED
        // This ensures idempotency and prevents race conditions where a SUCCESS callback
        // might be processed after a FAILED callback
        if (pembelian.status === 'SUCCESS' && purchaseStatus === 'FAILED') {
          console.log('Skipping update: pembelian already in SUCCESS state');
          return NextResponse.json({
            data: {
              ref_id: referenceId,
              status: "1", // Return success status code
              price: pembelian.harga?.toString() || "0",
              message: "Success",
              tr_id: pembelian.order_id,
              rc: "00"
            }
          });
        }

        // Update the pembelian record
        console.log('Updating pembelian with status:', purchaseStatus);
        const updatedPembelian = await tx.pembelian.update({
          where: { 
            order_id: pembelian.order_id
          },
          data: {
            status: purchaseStatus,
            sn: sn || "",
            ref_id: referenceId,
          }
        });
        console.log('Pembelian update result:', updatedPembelian);
      
        // Update the related transaction if available
        if (pembelian.transaction_id) {
          console.log('Updating transaction:', pembelian.transaction_id);
          const updatedTransaction = await tx.transaction.update({
            where: { id: pembelian.transaction_id },
            data: {
              paymentStatus: purchaseStatus,
              statusMessage: message || "",
              paymentReference: referenceId,
              completedAt : new Date(),
            }
          });
          console.log('Transaction update result:', updatedTransaction.paymentStatus);
        
          // Update the invoice if it exists
          const invoice = await tx.invoices.findFirst({
            where: { transactionId: pembelian.transaction_id }
          });
        
          if (invoice) {
            console.log('Updating invoice:', invoice.id);
            const updatedInvoice = await tx.invoices.update({
              where: { id: invoice.id },
              data: {
                status: purchaseStatus,
                paymentDate: purchaseStatus === 'SUCCESS' ? new Date() : null
              }
            });
            console.log('Invoice update result:', updatedInvoice.status);
          }
        }

        // Return response with existing pembelian details
        console.log('Returning success response for existing pembelian');
        return NextResponse.json({
          data: {
            ref_id: referenceId,
            status: statusCode,
            price: pembelian.harga?.toString() || "0",
            message: statusMessage,
            tr_id: pembelian.order_id,
            rc
          }
        });
      } else {
        console.log('Pembelian not found, trying alternative lookups');
        
        // If pembelian doesn't exist, try to find by looking up the transaction by merchantOrderId
        // Extract merchantOrderId from the log data
        const merchantOrderIdMatch = callbackData.log ? 
          /merchantOrderId=([^&\s]+)/.exec(callbackData.log) : null;
        const merchantOrderId = merchantOrderIdMatch ? merchantOrderIdMatch[1] : null;
        console.log('Extracted merchantOrderId:', merchantOrderId);
        
        let transaction;
        
        if (merchantOrderId) {
          transaction = await tx.transaction.findFirst({
            where: { merchantOrderId }
          });
          console.log('Transaction lookup by merchantOrderId:', transaction ? 'Found' : 'Not found');
        }
        
        // If not found by merchantOrderId, try by paymentReference
        if (!transaction) {
          transaction = await tx.transaction.findFirst({
            where: { paymentReference: referenceId }
          });
          console.log('Transaction lookup by paymentReference:', transaction ? 'Found' : 'Not found');
        }
        
        if (transaction) {
          // Find the corresponding pembelian by transaction_id
          const linkedPembelian = await tx.pembelian.findFirst({
            where: { transaction_id: transaction.id }
          });
          console.log('Linked pembelian lookup:', linkedPembelian ? 'Found' : 'Not found');
          
          if (linkedPembelian) {
            // Skip update if status is already SUCCESS and we're trying to set it to FAILED
            if (linkedPembelian.status === 'SUCCESS' && purchaseStatus === 'FAILED') {
              console.log('Skipping update: linked pembelian already in SUCCESS state');
              return NextResponse.json({
                data: {
                  ref_id: referenceId,
                  status: "1", // Return success status code
                  price: linkedPembelian.harga?.toString() || "0",
                  message: "Success",
                  tr_id: linkedPembelian.order_id,
                  rc: "00",
                  sn: linkedPembelian.sn || ""
                }
              });
            }

            // Update pembelian record
            console.log('Updating linked pembelian:', linkedPembelian.order_id);
            await tx.pembelian.update({
              where: { order_id: linkedPembelian.order_id },
              data: {
                status: purchaseStatus,
                sn: sn || "",
                ref_id: referenceId
              }
            });
          
            // Update transaction
            await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: purchaseStatus,
                statusMessage: message || "",
                paymentReference: referenceId,
                completedAt : new Date(),
              }
            });
          
            // Update invoice if it exists
            const invoice = await tx.invoices.findFirst({
              where: { transactionId: transaction.id }
            });
          
            if (invoice) {
              await tx.invoices.update({
                where: { id: invoice.id },
                data: {
                  status: purchaseStatus,
                  paymentDate: purchaseStatus === 'SUCCESS' ? new Date() : null
                }
              });
            }
            
            // Return response
            console.log('Returning success response for linked pembelian');
            return NextResponse.json({
              data: {
                ref_id: referenceId,
                status: purchaseStatus === 'SUCCESS' ? "1" : "2",
                price: linkedPembelian.harga?.toString() || "0",
                message: message || (purchaseStatus === 'SUCCESS' ? "Success" : "Gagal"),
                tr_id: linkedPembelian.order_id,
                rc: purchaseStatus === 'SUCCESS' ? "00" : "14",
                sn: sn || ""
              }
            });
          }
        }
        
        // If we still can't find the related record, try to find the service
        console.log('Attempting to find layanan with providerId:', buyer_sku_code);
        const layanan = await tx.layanan.findFirst({
          where: { providerId: buyer_sku_code.toLowerCase() } // Case insensitive search
        });
        console.log('Layanan lookup result:', layanan ? 'Found' : 'Not found');

        if (!layanan) {
          console.log('Product not valid, returning error');
          return NextResponse.json({
            data: {
              status: "2",
              message: "Product tidak valid",
              rc: "20",
              ref_id: referenceId
            }
          });
        }

        // Return generic response if we can't find the related records
        console.log('Returning generic response with layanan info');
        return NextResponse.json({
          data: {
            ref_id: referenceId,
            status: purchaseStatus === 'SUCCESS' ? "1" : "2",
            price: layanan.harga?.toString() || "0",
            message: message || (purchaseStatus === 'SUCCESS' ? "Success" : "Gagal"),
            rc: purchaseStatus === 'SUCCESS' ? "00" : "14",
            sn: sn || ""
          }
        });
      }
    }, {
      maxWait: 5000, 
      timeout: 10000 
        });
  } catch (error) {
    console.error('DigiFlazz callback error:', error);
    return NextResponse.json({
      data: {
        status: "2",
        message: "System error",
        rc: "99"
      }
    });
  }
}