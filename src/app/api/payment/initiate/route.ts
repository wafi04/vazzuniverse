import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { auth } from '../../../../../auth';
import { prisma } from '@/lib/prisma';
import {
  DUITKU_BASE_URL,
  DUITKU_CALLBACK_URL,
  DUITKU_EXPIRY_PERIOD,
  DUITKU_MERCHANT_CODE,
  DUITKU_RETURN_URL,
  DUITKU_API_KEY,
} from '../types';
import { Digiflazz } from '@/lib/digiflazz';
import { DIGI_KEY, DIGI_USERNAME } from '@/constants';

export type RequestPayment = {
  noWa: string;
  layanan: string;
  paymentCode: string;
  accountId: string;
  serverId: string;
  voucherCode?: string;
  game: string;
  typeTransaksi: string;
  nickname: string;
};

export async function POST(req: NextRequest) {
  try {
    const digiflazz = new Digiflazz(DIGI_USERNAME, DIGI_KEY)
    // Dapatkan body dari request
    const body = await req.json();

    const session = await auth();
    const {
      layanan,
      paymentCode,
      noWa,
      voucherCode,
      serverId,
      typeTransaksi,
      game,
      nickname,
      accountId,
    }: RequestPayment = body;


    console.log(body)

    // Validasi input
    if (!paymentCode || !layanan || !noWa) {
      return NextResponse.json(
        {
          statusCode: '400',
          statusMessage: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!DUITKU_MERCHANT_CODE || !DUITKU_API_KEY) {
      console.error('Missing Duitku configuration');
      return NextResponse.json(
        {
          statusCode: '500',
          statusMessage: 'Server configuration error',
        },
        { status: 500 }
      );
    }

    // Generate merchant order ID
    const randomStr = Math.random().toString(36).substring(2, 8);
    const merchantOrderId = 'ORD-' + Date.now() + '-' + randomStr;

    const generatePaymentReference = (type: string) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      return `${type}-${timestamp}-${randomId}`;
    };

    // Start a Prisma transaction
    return await prisma.$transaction(
      async (tx) => {
        // Fetch the service details
        const productDetails = await tx.layanan.findFirst({
          where: { layanan },
        });

        if (!productDetails) {
          return NextResponse.json(
            { statusCode: 404, message: 'Product NotFound' },
            { status: 404 }
          );
        }

        // Get category details for voucher validation
        const categoryDetails = await tx.categories.findFirst({
          where: { id: parseInt(productDetails.kategoriId) },
        });

        if (!categoryDetails) {
          return NextResponse.json(
            { statusCode: 404, message: 'Category NotFound' },
            { status: 404 }
          );
        }

        // Base price calculation
        let price: number;
        let discountAmount = 0;
        let appliedVoucherId: number | null = null;

        if (
          productDetails.isFlashSale &&
          productDetails.expiredFlashSale &&
          new Date(productDetails.expiredFlashSale) > new Date()
        ) {
          price = productDetails.hargaFlashSale || 0;
        } else if (session?.user?.role === 'Platinum') {
          price = productDetails.hargaPlatinum;
        } else {
          price = productDetails.harga;
        }

        // Apply voucher if provided
        if (voucherCode) {
          const voucher = await tx.voucher.findFirst({
            where: {
              code: voucherCode,
              isActive: true,
              expiryDate: { gt: new Date() },
              startDate: { lte: new Date() },
            },
            include: {
              categories: true,
            },
          });

          if (voucher) {
            // Check if usage limit is reached
            if (
              voucher.usageLimit &&
              voucher.usageCount >= voucher.usageLimit
            ) {
              return NextResponse.json(
                { statusCode: 400, message: 'Voucher usage limit reached' },
                { status: 400 }
              );
            }

            // Check if minimum purchase requirement is met
            if (voucher.minPurchase && price < voucher.minPurchase) {
              return NextResponse.json(
                {
                  statusCode: 400,
                  message: `Minimum purchase of ${voucher.minPurchase} required for this voucher`,
                },
                { status: 400 }
              );
            }

            // Check if voucher is applicable to this category
            const isApplicable =
              voucher.isForAllCategories ||
              voucher.categories.some(
                (vc) => vc.categoryId === categoryDetails.id
              );

            if (isApplicable) {
              if (voucher.discountType === 'PERCENTAGE') {
                // Apply percentage discount
                discountAmount = (price * voucher.discountValue) / 100;
                if (voucher.maxDiscount) {
                  discountAmount = Math.min(
                    discountAmount,
                    voucher.maxDiscount
                  );
                }
              } else {
                discountAmount = voucher.discountValue;
              }

              price = Math.max(0, price - discountAmount);
              appliedVoucherId = voucher.id;
            } else {
              return NextResponse.json(
                {
                  statusCode: 400,
                  message: 'Voucher not applicable to this product category',
                },
                { status: 400 }
              );
            }
          } else {
            return NextResponse.json(
              { statusCode: 400, message: 'Invalid or expired voucher code' },
              { status: 400 }
            );
          }
        }

        const paymentAmount = price;

        // Create transaction record
        const transactionData = {
          merchantOrderId,
          transactionType: 'Top up' ,
          originalAmount: productDetails.harga,
          discountAmount,
          finalAmount: paymentAmount,
          paymentStatus: 'PENDING',
          paymentCode,
          noWa,
        };

        // Add userId only if a user is logged in
        if (session?.user?.id) {
          // Check if user exists first
          const userExists = await tx.users.findUnique({
            where: { id: session.user.id },
          });

          if (userExists) {
            Object.assign(transactionData, { userId: session.user.id });
          }
        }

        if (appliedVoucherId) {
          Object.assign(transactionData, { voucherId: appliedVoucherId });
        }

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: transactionData,
        });

        const layanans = await tx.layanan.findFirst({
          where: {
            layanan,
          },
        });

        // Create pembelian record
        await tx.pembelian.create({
          data: {
            game,
            harga: paymentAmount,
            layanan,
            order_id: merchantOrderId,
            profit: productDetails.profit,
            status: 'PENDING',
            tipe_transaksi: typeTransaksi,
            username: session?.user?.username || 'Guest',
            user_id: session?.user?.id,
            zone: serverId,
            provider_order_id: layanans?.providerId,
            nickname,
            accountID: accountId,
            transaction_id: transaction.id,
            ref_id: null,
          },
        });

        // If voucher is applied, increment its usage count
        if (appliedVoucherId) {
          await tx.voucher.update({
            where: { id: appliedVoucherId },
            data: { usageCount: { increment: 1 } },
          });
        }

        // Check deposit availability if user is logged in
        if (session?.user?.id && paymentCode === "DEPOSIT") {
          await tx.users.update({
            where: { id: session.user.id },
            data: {
              balance: {
                decrement: paymentAmount
              }
            }
          });

          // Generate standardized payment reference for deposit
          const paymentReference = generatePaymentReference('DEPOSIT');
          
          // Update transaction status to success
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: 'PAID',
              paymentReference,
            }
          });
        
          await tx.invoices.create({
            data: {
              invoiceNumber: `INV-${merchantOrderId}`,
              transactionId: transaction.id,
              userId: session.user.id,
              subtotal: transaction.originalAmount,
              discountAmount: transaction.discountAmount,
              totalAmount: transaction.finalAmount,
              status: 'PAID',
              dueDate: new Date(),
              paymentDate: new Date(),
              termsAndConditions: 'Standard terms and conditions apply.',
            },
          });
          
          // Update pembelian status to success
          await tx.pembelian.update({
            where: { order_id: merchantOrderId },
            data: { 
              status: 'PAID',
            }
          });
        
          const reqtoDigi = await digiflazz.TopUp({
            productCode: layanans?.providerId as string,
            userId: accountId,
            whatsapp: noWa,
            serverId: serverId,
            refid: paymentReference
          });

          const datas = reqtoDigi.data
          if(datas) {            
            await tx.pembelian.update({
              where: { order_id: merchantOrderId },
              data: { 
                status: datas.status === 'Pending' ? 'PROCESS' : 
                       datas.status === 'Sukses' ? 'SUCCESS' : 'FAILED',
                sn: datas.sn,
                ref_id: datas.ref_id
              }
            });
            
            // Also update the transaction record
            await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: datas.status === 'Pending' ? 'PROCESS' : 
                              datas.status === 'Sukses' ? 'PAID' : 'FAILED',
                statusMessage: datas.message,
                paymentReference: datas.ref_id 
              }
            });
          }
          
          // // Return success response
          return NextResponse.json({
            reference: paymentReference,
            statusCode: "00",
            paymentUrl: `${process.env.NEXTAUTH_URL}/payment/status?merchantOrderId=${merchantOrderId}`,
            statusMessage: "PROCESS",
            merchantOrderId: merchantOrderId,
            transactionId: transaction.id,
          });
        }

        // Generate signature for Duitku
        const signature = crypto
          .createHash('md5')
          .update(
            DUITKU_MERCHANT_CODE +
              merchantOrderId +
              paymentAmount +
              DUITKU_API_KEY
          )
          .digest('hex');

        const payload = {
          merchantCode: DUITKU_MERCHANT_CODE,
          paymentAmount: paymentAmount,
          merchantOrderId: merchantOrderId,
          productDetails: layanan,
          paymentMethod: paymentCode,
          customerVaName: nickname,
          phoneNumber: noWa,
          returnUrl: `${DUITKU_RETURN_URL}`,
          callbackUrl: DUITKU_CALLBACK_URL,
          signature: signature,
          expiryPeriod: DUITKU_EXPIRY_PERIOD,
        };


        try {
          const response = await axios.post(
            `${DUITKU_BASE_URL}/api/merchant/v2/inquiry`,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          console.log('Duitku API response:', response.data);
          const data = response.data;

          // Check for valid response
          if (!data.statusCode) {
            return NextResponse.json(
              {
                success: false,
                message: 'Invalid response from API: ' + JSON.stringify(data),
              },
              { status: 500 }
            );
          }

          // Check for error status
          if (data.statusCode !== '00') {
            await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: 'FAILED',
                statusMessage: data.statusMessage,
              },
            });

            return NextResponse.json(
              {
                statusCode: data.statusCode,
                statusMessage: data.statusMessage,
              },
              { status: 400 }
            );
          }

      
          const paymentReference = data.reference;

          // Update transaction with payment reference
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentReference: paymentReference,
              paymentUrl: data.paymentUrl,
            },
          });

          // Update pembelian with reference ID
          await tx.pembelian.update({
            where: { order_id: merchantOrderId },
            data: { ref_id: paymentReference },
          });

        
          return NextResponse.json({
            paymentUrl: data.paymentUrl,
            reference: paymentReference,
            statusCode: data.statusCode,
            statusMessage: data.statusMessage,
            merchantOrderId: merchantOrderId,
            transactionId: transaction.id,
          });
        } catch (apiError: any) {
          console.error('Duitku API error:', apiError.message);
          console.error('Response data:', apiError.response?.data);

          // Update transaction status to failed
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: 'FAILED',
              statusMessage:
                apiError.response?.data?.message || 'Payment gateway error',
            },
          });

          return NextResponse.json(
            {
              statusCode: apiError.response?.status || '500',
              statusMessage:
                apiError.response?.data?.message || 'Payment gateway error',
            },
            { status: apiError.response?.status || 500 }
          );
        }
      },
      {
        maxWait: 5000, // 5s maximum wait time
        timeout: 10000, // 10s timeout
      }
    );
  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: 'Error processing transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}