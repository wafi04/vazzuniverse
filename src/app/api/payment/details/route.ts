// app/api/payment/check-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  DUITKU_BASE_URL,
  DUITKU_MERCHANT_CODE,
  DUITKU_API_KEY,
} from '../types';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const merchantOrderId = url.searchParams.get('merchantOrderId');
  console.log(merchantOrderId);

  if (!merchantOrderId) {
    return NextResponse.json(
      { message: 'merchantOrderId is required' },
      { status: 400 }
    );
  }

  try {
    // Generate signature
    const signature = generateSignature(merchantOrderId);

    // Buat payload
    const payload = {
      merchantCode: DUITKU_MERCHANT_CODE,
      merchantOrderId,
      signature,
    };

    // Request ke Duitku API
    const response = await fetch(
      `${DUITKU_BASE_URL}/api/merchant/transactionStatus`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    const transaction = await prisma.transaction.findUnique({
      where: {
        merchantOrderId: data.merchantOrderId,
      },
      include: {
        category: true,
        invoice: true,
        layanan: true,
      },
    });

    return NextResponse.json({
      data: {
        transaction,
      },
      status: true,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Check status error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fungsi untuk generate signature
function generateSignature(merchantOrderId: string): string {
  if (!DUITKU_MERCHANT_CODE || !DUITKU_API_KEY) {
    throw new Error('Missing Duitku configuration');
  }

  const plainSignature =
    DUITKU_MERCHANT_CODE + merchantOrderId + DUITKU_API_KEY;
  return crypto.createHash('md5').update(plainSignature).digest('hex');
}
