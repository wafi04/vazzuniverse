import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DUITKU_MERCHANT_CODE } from '../types';
import { getStatusMessage } from '../helpers';
import { v4 as uuidv4 } from 'uuid';
import { Digiflazz } from '@/lib/digiflazz';
import { DIGI_KEY, DIGI_USERNAME } from '@/constants';

export async function POST(req: NextRequest) {
  try {
    // Get callback data from Duitku
    let callbackData;
    const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_KEY);

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      callbackData = await req.json();
    } else {
      const formData = await req.formData();
      callbackData = Object.fromEntries(formData.entries());

      if (callbackData.amount) {
        callbackData.amount = callbackData.amount.toString();
      }
    }

    console.log('called callback request');
    console.log('Received callback data:', callbackData);

    // Extract important fields
    const {
      merchantCode,
      merchantOrderId,
      amount,
      signature,
      resultCode,
      reference,
      productDetails,
      phoneNumber,
    } = callbackData;

    // Validate required fields
    if (
      !merchantCode ||
      !merchantOrderId ||
      !amount ||
      !signature ||
      !resultCode
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate merchantCode
    if (merchantCode !== DUITKU_MERCHANT_CODE) {
      console.error('Invalid merchant code:', merchantCode);
      return NextResponse.json(
        { success: false, message: 'Invalid merchant code' },
        { status: 400 }
      );
    }

    // Using Prisma transaction for all database operations
    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { merchantOrderId },
      });

      if (!transaction) {
        console.error('Transaction not found:', merchantOrderId);
        return NextResponse.json(
          { success: false, message: 'Transaction not found' },
          { status: 404 }
        );
      }

      const depositIdMatch = merchantOrderId.match(/^DEP-(\d+)-/);
      const orderTopUp = merchantOrderId.match(/^ORD-(\d+)-/);
      const depositId = depositIdMatch ? parseInt(depositIdMatch[1]) : null;

      let paymentStatus = 'PENDING';
      if (resultCode === '00' || resultCode === '0') {
        if (transaction.transactionType === "DEPOSIT") {
          paymentStatus = "SUCCESS";
        } else {
          paymentStatus = 'PAID';
        }
      } else if (resultCode === '01') {
        paymentStatus = 'PENDING';
      } else {
        paymentStatus = 'FAILED';
      }

      // Check if we should skip updates for idempotency
      // Don't downgrade from SUCCESS to FAILED
      if (transaction.paymentStatus === 'SUCCESS' && paymentStatus === 'FAILED') {
        console.log('Skipping downgrade from SUCCESS to FAILED for idempotency');
        return NextResponse.json({ success: true });
      }

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { merchantOrderId },
        data: {
          paymentStatus,
          paymentReference: reference || transaction.paymentReference,
          statusMessage: getStatusMessage(resultCode),
          updatedAt: new Date(),
        },
      });

      // Update deposit status
      if (transaction.transactionType === "DEPOSIT" && depositId) {
        const updatedDeposit = await tx.deposits.update({
          where: { id: depositId },
          data: { status: paymentStatus },
        });
        if (paymentStatus === 'SUCCESS') {
          const deposit = await tx.deposits.findUnique({
            where: { id: depositId },
          });
          
          let role :string = "Member"
          if (deposit) {
            if(deposit.amount > 50000){
              role =  "Platinum"
            }
            await tx.users.update({
              where: { id: deposit.userId },
              data: {
                role,
                balance: {
                  increment: deposit.amount,
                },
              },
            });
          }
        }
      }

      if (orderTopUp) {
        let userId;

        if (transaction.userId) {
          // Use existing user ID if it exists
          userId = transaction.userId;
        } else {
          // Create a new guest user if needed
          const guestUser = await tx.users.create({
            data: {
              id: `guest_${uuidv4()}`,
              name: 'user',
              username: `user_${merchantOrderId}`,
              role: 'Member',
              password: 'pass',
              whatsapp: phoneNumber,
              balance: 0,
            },
          });
          userId = guestUser.id;
          
          // Update transaction with the new userId
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { userId: userId }
          });
        }

        // Find the pembelian record
        const pembelian = await tx.pembelian.findFirst({
          where: {
            order_id: transaction.merchantOrderId,
          },
        });
        
        const layanan = await tx.layanan.findFirst({
          where: {
            layanan: productDetails,
          },
        });
        
        console.log('Layanan:', layanan);
        console.log('Pembelian:', pembelian);

        if (layanan && pembelian) {
          const reqtoDigi = await digiflazz.TopUp({
            productCode: layanan.providerId as string,
            userId: pembelian.accountID as string,
            whatsapp: phoneNumber,
            refid: transaction.paymentReference as string,
            serverId: pembelian.zone as string
          });
          
          const datas = reqtoDigi.data;
          
          if (datas) {
            // Only update if this is a valid improvement to the status
            // Don't downgrade from SUCCESS to PROCESS or FAILED
            const currentPembelianStatus = pembelian.status;
            const newStatus = datas.status === 'Pending' ? 'PROCESS' : 
                             datas.status === 'Sukses' ? 'SUCCESS' : 'FAILED';
            
            if (currentPembelianStatus !== 'SUCCESS' || newStatus === 'SUCCESS') {
              await tx.pembelian.update({
                where: { order_id: merchantOrderId },
                data: { 
                  status: newStatus,
                  sn: datas.sn,
                  ref_id: datas.ref_id
                }
              });
              
              // Also update the transaction record
              const newTransactionStatus = datas.status === 'Pending' ? 'PROCESS' : 
                                          datas.status === 'Sukses' ? 'SUCCESS' : 'FAILED';
              
              if (updatedTransaction.paymentStatus !== 'SUCCESS' || newTransactionStatus === 'SUCCESS') {
                await tx.transaction.update({
                  where: { id: transaction.id },
                  data: {
                    paymentStatus: newTransactionStatus,
                    statusMessage: datas.message,
                    paymentReference: datas.ref_id 
                  }
                });
              }
            } else {
              console.log(`Skipping pembelian update because current status (${currentPembelianStatus}) is SUCCESS and new status is ${newStatus}`);
            }
          }
        }
      }
      
      // Also update any related invoice
      const invoice = await tx.invoices.findFirst({
        where: { transactionId: transaction.id }
      });
      
      if (invoice) {
        await tx.invoices.update({
          where: { id: invoice.id },
          data: {
            status: paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' ? 'SUCCESS' : paymentStatus,
            paymentDate: paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' ? new Date() : null,  
          }
        });
      }

      // Return success response to Duitku
      return NextResponse.json({ success: true });
    }, {
      maxWait: 5000,  // maximum time to wait for transaction to start
      timeout: 10000  // maximum time transaction can run
    });
  } catch (error) {
    console.error('Callback processing error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error processing callback',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 } // Return 200 even on error to prevent Duitku from retrying
    );
  }
}