import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Midtrans server key from environment variable
const SERVER_KEY = 'SB-Mid-server-xll84pqWliwD5uVKipxs3zP5';

export async function POST(req: NextRequest) {
  try {
    // Get notification data from Midtrans
    const notification = await req.json();
    console.log('Received notification from Midtrans:', notification);

    const {
      order_id,
      transaction_status,
      fraud_status,
      signature_key,
      gross_amount,
      status_code,
    } = notification;

    // Verify signature to ensure callback is authentic
    const expectedSignature = crypto
      .createHash('sha512')
      .update(order_id + status_code + String(gross_amount) + SERVER_KEY)
      .digest('hex');

    if (signature_key !== expectedSignature) {
      console.error('Invalid signature from Midtrans');
      return NextResponse.json(
        { status: 'error', message: 'Invalid signature' },
        { status: 403 }
      );
    }

    console.log('Payload:', notification);

    // Find the transaction in your database
    const transaction = await prisma.transaction.findUnique({
      where: { merchantOrderId: order_id },
    });

    if (!transaction) {
      console.error(`Transaction with order ID ${order_id} not found`);
      return NextResponse.json(
        { status: 'error', message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Determine the payment status based on Midtrans status
    let paymentStatus;
    let statusMessage = '';

    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'challenge') {
          paymentStatus = 'CHALLENGE';
          statusMessage = 'Payment challenged by fraud detection system';
        } else if (fraud_status === 'accept') {
          paymentStatus = 'PAID';
          statusMessage = 'Payment completed successfully';
        }
        break;
      case 'settlement':
        paymentStatus = 'PAID';
        statusMessage = 'Payment completed successfully';
        break;
      case 'pending':
        paymentStatus = 'PENDING';
        statusMessage = 'Waiting for payment';
        break;
      case 'deny':
        paymentStatus = 'DENIED';
        statusMessage = 'Payment denied';
        break;
      case 'cancel':
      case 'expire':
        paymentStatus = 'FAILED';
        statusMessage =
          transaction_status === 'cancel'
            ? 'Payment cancelled'
            : 'Payment expired';
        break;
      case 'refund':
        paymentStatus = 'REFUNDED';
        statusMessage = 'Payment refunded';
        break;
      default:
        paymentStatus = 'UNKNOWN';
        statusMessage = `Unknown status: ${transaction_status}`;
    }

    // Update transaction in database
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus,
        statusMessage,
        completedAt: ['PAID', 'REFUNDED'].includes(paymentStatus as string)
          ? new Date()
          : null,
      },
    });

    // If payment is successful, update related invoice
    if (paymentStatus === 'PAID') {
      // Validate userId
      const userId =
        transaction.userId || `guest_${transaction.merchantOrderId}`; // Replace 'guest_user_id' with a valid guest user ID

      const userExists = await prisma.users.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        console.error(`User with ID ${userId} does not exist`);
        return NextResponse.json(
          { status: 'error', message: 'Invalid user ID' },
          { status: 400 }
        );
      }

      // Find related invoice
      const invoice = await prisma.invoices.findFirst({
        where: { transactionId: transaction.id },
      });

      if (invoice) {
        await prisma.invoices.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paymentDate: new Date(),
          },
        });
      } else {
        // Create invoice if it doesn't exist yet
        const newInvoice = await prisma.invoices.create({
          data: {
            invoiceNumber: `INV-${order_id}`,
            transactionId: transaction.id,
            userId: userId,
            subtotal: transaction.originalAmount,
            discountAmount: transaction.discountAmount,
            totalAmount: transaction.finalAmount,
            status: 'PAID',
            dueDate: new Date(),
            paymentDate: new Date(),
            notes: `Payment for service ID: ${transaction.layananId}`,
            termsAndConditions: 'Standard terms and conditions apply.',
          },
        });

        // Create invoice item
        await prisma.invoiceItems.create({
          data: {
            invoiceId: newInvoice.id,
            description: `Service ID: ${transaction.layananId}`,
            quantity: 1,
            unitPrice: transaction.finalAmount,
            amount: transaction.finalAmount,
          },
        });
      }
    }

    // Send response back to Midtrans
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing Midtrans callback:', error);
      return NextResponse.json(
        {
          status: false,
          message: error.message,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      status: false,
      message: 'Internal server error',
    });
  }
}
