// app/api/payment/check-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
const MERCHANT_CODE = 'DS22364';
const API_KEY = '175d818a310577f6bd9f12610a9ae36b';
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://passport.duitku.com/webapi'
    : 'https://sandbox.duitku.com/webapi';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const merchantOrderId = url.searchParams.get('merchantOrderId');

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
      merchantCode: MERCHANT_CODE,
      merchantOrderId,
      signature,
    };

    // Request ke Duitku API
    const response = await fetch(`${BASE_URL}/api/merchant/transactionStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data);
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
  if (!MERCHANT_CODE || !API_KEY) {
    throw new Error('Missing Duitku configuration');
  }

  const plainSignature = MERCHANT_CODE + merchantOrderId + API_KEY;
  return crypto.createHash('md5').update(plainSignature).digest('hex');
}
