import {
  sendAdminNotification,
  sendCustomerNotification,
} from '@/lib/whatsapp-message';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await sendAdminNotification({
      orderData: {
        amount: 1000,
        link: 'https;//',
        productName: 'unit testing',
        status: 'PENDING',
        customerName: 'GUEST',
        method: undefined,
        orderId: 'ORD-AUAGAASAVA',
        whatsapp: process.env.NOMOR_WA_ADMIN,
      },
    });

    await sendCustomerNotification({
      orderData: {
        amount: 1000,
        link: 'https;//',
        productName: 'unit testing',
        status: 'PENDING',
        customerName: 'GUEST',
        method: undefined,
        orderId: 'ORD-AUAGAASAVA',
        whatsapp: '6282226197047',
      },
    });

    return NextResponse.json({ success: true, message: 'berhasil' });
  } catch (error) {
    return NextResponse.json({
      error: `error : ${error}`,
    });
  }
}
