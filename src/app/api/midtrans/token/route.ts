import { NextResponse } from 'next/server';
import { SERVER_KEY } from '../status/route';

export async function POST(req: Request) {
  try {
    const { customer_name, customer_email } = await req.json();

    const orderId = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    const auth = `Basic ${Buffer.from(SERVER_KEY + ':').toString('base64')}`;

    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        payment_type: 'gopay',
        transaction_details: {
          order_id: orderId,
          gross_amount: parseInt('18604.00', 10),
        },
        customer_details: {
          first_name: customer_name || 'John',
          last_name: '',
          email: customer_email || 'johndoe@example.com',
          phone: '08123456789',
        },
      }),
    });

    const data = await response.json();

    console.log('Midtrans Response:', JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: data.status_code === '201',
      order_id: orderId,
      data: data,
    });
  } catch (error) {
    console.error('Midtrans Error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction', details: error },
      { status: 500 }
    );
  }
}
