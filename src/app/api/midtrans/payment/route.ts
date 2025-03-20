import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '@/lib/prisma';
import { generateOrderId, URL_MIDTRANS_CHARGE } from '../cons';

// Midtrans server key dari environment variable
const SERVER_KEY = 'SB-Mid-server-xll84pqWliwD5uVKipxs3zP5';

export type RequestPayment = {
  noWa: string;
  layanan: string;
  paymentCode: string;
};

export async function POST(req: NextRequest) {
  try {
    // Dapatkan body dari request
    const body = await req.json();
    console.log(body);

    const session = await auth();
    const {
      layanan,
      paymentCode,
      noWa,
      voucherCode,
    }: RequestPayment & { voucherCode?: string } = body;

    // Fetch the service details
    const productDetails = await prisma.layanan.findFirst({
      where: { layanan },
    });

    if (!productDetails) {
      return NextResponse.json(
        { statusCode: 404, message: 'Product NotFound' },
        { status: 404 }
      );
    }

    // Get category details for voucher validation
    const categoryDetails = await prisma.categories.findFirst({
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
    let discountAmount: number = 0;
    let appliedVoucherId: number | null = null;

    if (
      productDetails.isFlashSale &&
      productDetails.expiredFlashSale &&
      new Date(productDetails.expiredFlashSale) > new Date()
    ) {
      price = productDetails.hargaFlashSale || 0;
    } else if (session?.user?.role === 'platinum') {
      price = productDetails.hargaPlatinum;
    } else if (session?.user?.role === 'gold') {
      price = productDetails.hargaGold;
    } else {
      price = productDetails.harga;
    }

    // Apply voucher if provided (voucher logic tetap sama seperti sebelumnya)
    if (voucherCode) {
      const voucher = await prisma.voucher.findFirst({
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
        if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
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
          voucher.categories.some((vc) => vc.categoryId === categoryDetails.id);

        if (isApplicable) {
          // const originalPrice = price;

          if (voucher.discountType === 'PERCENTAGE') {
            // Apply percentage discount
            discountAmount = (price * voucher.discountValue) / 100;
            if (voucher.maxDiscount) {
              discountAmount = Math.min(discountAmount, voucher.maxDiscount);
            }
          } else {
            // Apply fixed amount discount
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

    // Validasi input
    if (!paymentCode || !layanan || !noWa) {
      return NextResponse.json(
        {
          statusCode: 400,
          statusMessage: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!SERVER_KEY) {
      console.error('Missing Midtrans configuration');
      return NextResponse.json(
        {
          statusCode: 500,
          statusMessage: 'Server configuration error',
        },
        { status: 500 }
      );
    }

    // Generate order ID
    const merchantOrderId = generateOrderId();

    // Prepare transaction data
    const transactionData = {
      merchantOrderId,
      layananId: productDetails.id,
      categoryId: categoryDetails.id,
      originalAmount: productDetails.harga,
      discountAmount,
      finalAmount: price,
      paymentStatus: 'PENDING',
      paymentCode,
      noWa,
      createdAt: new Date(),
    };

    // Add userId only if a user is logged in
    if (session?.user?.id) {
      const userExists = await prisma.users.findUnique({
        where: { id: session.user.id },
      });

      if (userExists) {
        Object.assign(transactionData, { userId: session.user.id });
      }
    }

    // Add voucher only if it was applied
    if (appliedVoucherId) {
      Object.assign(transactionData, { voucherId: appliedVoucherId });
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: transactionData,
    });

    // If voucher is applied, increment its usage count
    if (appliedVoucherId) {
      await prisma.voucher.update({
        where: { id: appliedVoucherId },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Konversi paymentCode dari Duitku ke format Midtrans
    let paymentType = 'bank_transfer';
    let bankCode;

    // Mapping kode pembayaran Duitku ke Midtrans
    switch (paymentCode) {
      // Virtual Account

      case 'mandiri':
        paymentType = 'bank_transfer';
        bankCode = 'mandiri';
        break;
      case 'VA':
      case 'bni':
        paymentType = 'bank_transfer';
        bankCode = 'bni';
        break;
      case 'bri': // BRI VA
        paymentType = 'bank_transfer';
        bankCode = 'bri';
        break;
      // E-wallet
      case 'OV': // OVO
        paymentType = 'ovo';
        break;
      case 'SA': // Shopee Pay
        paymentType = 'shopeepay';
        break;
      case 'LQ':
        paymentType = 'qris';
        break;
      case 'DA':
        paymentType = 'qris';
        break;
      // QRIS
      case 'QR':
        paymentType = 'qris';
        break;
      // Retail
      case 'alfamart':
        paymentType = 'cstore';
        bankCode = 'alfamart';
        break;
      case 'A1':
        paymentType = 'cstore';
        bankCode = 'indomaret';
        break;
      default:
        paymentType = 'bank_transfer';
        bankCode = 'bca';
    }

    // Buat payload untuk Midtrans API
    const transactionDetails = {
      transaction_details: {
        order_id: merchantOrderId,
        gross_amount: Math.floor(price),
      },
      item_details: [
        {
          id: layanan,
          price: Math.floor(price),
          quantity: 1,
          name: productDetails.layanan,
        },
      ],
      customer_details: {
        phone: noWa,
      },
    };

    // Konfigurasi berdasarkan metode pembayaran
    let paymentDetails = {};

    if (paymentType === 'bank_transfer') {
      paymentDetails = {
        payment_type: 'bank_transfer',
        bank_transfer: {
          bank: bankCode,
        },
      };
    } else if (paymentType === 'ovo' || paymentType === 'shopeepay') {
      paymentDetails = {
        payment_type: paymentType,
      };
    } else if (paymentType === 'qris') {
      paymentDetails = {
        payment_type: 'qris',
      };
    } else if (paymentType === 'cstore') {
      paymentDetails = {
        payment_type: 'cstore',
        cstore: {
          store: bankCode,
        },
      };
    }

    const requestBody = {
      ...transactionDetails,
      ...paymentDetails,
    };

    // Authentication untuk Midtrans
    const authString = Buffer.from(`${SERVER_KEY}:`).toString('base64');

    console.log('Sending payload to Midtrans:', requestBody);

    try {
      // Panggil API Midtrans
      const response = await fetch(URL_MIDTRANS_CHARGE, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Dapatkan response dari Midtrans
      const data = await response.json();
      console.log('Midtrans API response:', data);

      // Check for valid response
      if (!data.status_code) {
        // Update transaction status to failed
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: 'FAILED',
            statusMessage: 'Invalid response from Midtrans',
          },
        });

        return NextResponse.json(
          {
            statusCode: 400,
            statusMessage: 'Invalid response from API',
          },
          { status: 400 }
        );
      }

      // Check for successful response (Midtrans uses 200-series status codes for success)
      const isSuccess = data.status_code.toString().startsWith('2');

      if (isSuccess) {
        // Extract payment URL and other details based on payment type
        let paymentUrl = '';
        let paymentReference = '';

        if (paymentType === 'bank_transfer') {
          // For virtual account payments
          paymentReference = data.va_numbers[0]?.va_number;
        } else if (paymentType === 'qris') {
          paymentUrl =
            data.actions?.find((a) => a.name === 'generate-qr-code')?.url || '';
          paymentReference = data.transaction_id || '';
        } else if (paymentType === 'ovo' || paymentType === 'shopeepay') {
          paymentUrl =
            data.actions?.find((a) => a.name === 'deeplink-redirect')?.url ||
            '';
          paymentReference = data.transaction_id || '';
        } else if (paymentType === 'cstore') {
          paymentReference = data.payment_code || '';
        }

        // Update transaction with payment reference
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentReference: paymentReference,
            paymentUrl: paymentUrl,
            paymentStatus: 'PENDING',
            statusMessage: data.status_message,
          },
        });
        // If no user ID in session, create a guest user first
        if (!session?.user?.id) {
          const guestUserId = `guest_${merchantOrderId}`;

          // Check if this guest user already exists
          const existingUser = await prisma.users.findUnique({
            where: { id: guestUserId },
          });

          if (!existingUser) {
            // Create guest user
            await prisma.users.create({
              data: {
                id: guestUserId,
                name: `Guest User`,
                username: `guest_${merchantOrderId}`, // Use temporary email
                role: 'guest',
                password: 'guest',
                whatsapp: noWa,
                balance: 0,
              },
            });
          }

          // Update transaction with the guest user ID
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              userId: guestUserId,
            },
          });

          // Now create invoice with this guest user
          await prisma.invoices.create({
            data: {
              invoiceNumber: `INV-${merchantOrderId}`,
              transactionId: transaction.id,
              userId: guestUserId,
              subtotal: productDetails.harga,
              taxAmount: 0,
              discountAmount: discountAmount,
              totalAmount: price,
              status: 'PENDING',
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              notes: `Payment for ${productDetails.layanan}`,
              termsAndConditions: 'Standard terms and conditions apply.',
            },
          });
        }

        return NextResponse.json({
          success: true,
          paymentUrl: paymentUrl,
          reference: paymentReference,
          statusCode: data.status_code,
          statusMessage: data.status_message,
          merchantOrderId: merchantOrderId,
          transactionId: transaction.id,
          amount: Math.floor(price),
          data: data,
        });
      } else {
        // Update transaction status to failed
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: 'FAILED',
            statusMessage: data.status_message,
          },
        });

        return NextResponse.json(
          {
            success: false,
            statusCode: data.status_code,
            statusMessage: data.status_message,
          },
          { status: 400 }
        );
      }
    } catch (apiError: any) {
      console.error('Midtrans API error:', apiError.message);
      console.error('Response data:', apiError.response?.data);

      // Update transaction status to failed
      await prisma.transaction.update({
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
  } catch (error) {
    console.error('Payment initiation error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          statusCode: '400',
          statusMessage: error?.message || 'Internal server error',
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          statusCode: '500',
          statusMessage: 'Internal server error',
        },
        { status: 500 }
      );
    }
  }
}
