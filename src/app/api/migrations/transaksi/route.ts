// app/api/users/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch data from the external API
    const response = await fetch('http://localhost:8000/api/transaction', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseData = await response.json();

    if (
      responseData.status !== 'success' ||
      !Array.isArray(responseData.data)
    ) {
      throw new Error('Invalid response format');
    }

    return NextResponse.json({
      status: 'success',
      message: `Successfully processed  users`,
      data: responseData,
    });
  } catch (error) {
    console.error('Error processing users:', error);
    return NextResponse.json(
      {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
