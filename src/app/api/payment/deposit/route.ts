import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '../../../../../auth';
import { findUserById } from '@/app/(auth)/_components/api';
import { DUITKU_API_KEY, DUITKU_MERCHANT_CODE } from '../types';
import { Duitku } from '../duitku/DuitkuService';
import { GenerateMerchantOrderID } from '../helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const duitku = new Duitku();
    const { amount, code } = body;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findUserById(session.user.id as string);

    if (!user) {
      return NextResponse.json({ error: 'User not Found' }, { status: 404 });
    }

    // Find payment method
    const method = await prisma.methods.findFirst({
      where: { code },
      select: { name: true },
    });

    if (!method) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }
    let deposit;
    let merchantOrderId;
    let timestamp;
    let signature;

    // Use Prisma transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create deposit record first
      deposit = await tx.deposits.create({
        data: {
          userId: user.id,
          method: method.name,
          status: 'PENDING',
          username: user.username,
          amount,
        },
      });

      // Generate required payment info
      timestamp = Math.floor(Date.now() / 1000);
      merchantOrderId = GenerateMerchantOrderID(deposit.id, user.id);
      const paymentAmount = amount.toString();
      
      signature = crypto
        .createHash('md5')
        .update(
          DUITKU_MERCHANT_CODE + merchantOrderId + paymentAmount + DUITKU_API_KEY
        )
        .digest('hex');

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          merchantOrderId,
          userId: user.id,
          originalAmount: amount,
          discountAmount: 0,
          finalAmount: amount,
          paymentStatus: 'PENDING',
          paymentCode: code,
          transactionType: 'DEPOSIT',
          paymentUrl: null,
          noWa: user.whatsapp as string,
          statusMessage: null,
        },
      });

      return { deposit, transaction, merchantOrderId, timestamp, signature };
    });

    // Now create the payment in Duitku - after DB transaction completes
    const paymentData = await duitku.Create({
      amount,
      code,
      merchantOrderId: result.merchantOrderId,
      productDetails: `Deposit for ${user.username}`,
      sign: result.signature,
      time: result.timestamp,
      username: user.username,
      returnUrl: `${process.env.NEXTAUTH_URL}/profile`,
    });

    // Check if payment creation was successful
    if (paymentData.statusCode !== '00') {
      // Update both records to FAILED status
      await prisma.$transaction([
        prisma.deposits.update({
          where: { id: result.deposit.id },
          data: { status: 'FAILED' },
        }),
        prisma.transaction.update({
          where: { merchantOrderId: result.merchantOrderId },
          data: { 
            paymentStatus: 'FAILED', 
            statusMessage: paymentData.statusMessage 
          },
        })
      ]);

      return NextResponse.json(
        {
          error: 'Failed to create payment',
          details: paymentData.statusMessage,
        },
        { status: 400 }
      );
    }
    await prisma.transaction.update({
      where: { merchantOrderId: result.merchantOrderId },
      data: { paymentUrl: paymentData.paymentUrl },
    });

    return NextResponse.json({
      paymentUrl: paymentData.paymentUrl,
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}