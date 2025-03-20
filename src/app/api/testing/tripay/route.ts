import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testResponse = await axios.get(
      'https://tripay.co.id/api-sandbox/merchant/payment-channel',
      {
        headers: {
          Authorization:
            'Bearer ' + 'DEV-ITfguoXA76baew7O4ChJ0eqVaDO0Lcg9OzhayyQR',
        },
      }
    );
    console.log('Test response:', testResponse.data);
    return NextResponse.json({ status: true });
  } catch (error) {
    return NextResponse.json({ status: false });
  }
}
