import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MERCHANT_CODE = process.env.DUITKU_DEV_MERCHANT;
const API_KEY = process.env.DUITKU_DEV_API_KEY;
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://passport.duitku.com/webapi'
    : 'https://sandbox.duitku.com/webapi';

export async function GET() {
  try {
    const reference = 'DS2231025DCH7QUQZFGCNH0Z';
    const signature = crypto
      .createHash('md5')
      .update(MERCHANT_CODE + reference + API_KEY)
      .digest('hex');

    const payload = {
      merchantCode: MERCHANT_CODE,
      reference: reference,
      signature: signature,
    };

    const response = await fetch(`${BASE_URL}/api/merchant/transactionStatus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.statusCode === '00' || data.statusCode === '01') {
      // Berhasil mendapatkan detail transaksi
      const paymentDetails = {
        reference: data.reference,
        amount: data.amount,
        merchantOrderId: data.merchantOrderId,
        paymentMethod: data.paymentMethod,
        resultCode: data.resultCode,
        resultMessage: data.resultMessage,
        vaNumber: data.vaNumber || null,
        qrString: data.qrString || null,
        qrUrl: data.qrUrl || null,
        paymentDate: data.paymentDate || null,
      };

      return NextResponse.json(paymentDetails);
    } else {
      return NextResponse.json(
        {
          message: 'Failed to get transaction details',
          statusCode: data.statusCode,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
