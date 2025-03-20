import { NextResponse } from 'next/server';

const SERVER_KEY = 'SB-Mid-server-xll84pqWliwD5uVKipxs3zP5';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const order_id = searchParams.get('order_id') ?? 'ORDER-1741716050333-22353';

  if (!order_id) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    const auth = `Basic ${Buffer.from(SERVER_KEY + ':').toString('base64')}`;

    const response = await fetch(
      `https://api.sandbox.midtrans.com/v2/${order_id}/status`,
      {
        method: 'GET',
        headers: { Authorization: auth },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Midtrans Status Error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
