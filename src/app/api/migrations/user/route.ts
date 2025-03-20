// app/api/users/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch data from the external API
    const response = await fetch('http://localhost:8000/api/users/all', {
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

    // Process and store each user in the database
    const results = await Promise.all(
      responseData.data.map(async (userData) => {
        // Format the data according to your Prisma schema, but without the id field
        const formattedUser = {
          name: userData.name || null,
          username: userData.username,
          password: userData.password,
          whatsapp: userData.whatsapp,
          balance: userData.balance || 0,
          apiKey: userData.api_key || null,
          otp: userData.otp || null,
          role: userData.role || 'Member',
          createdAt: new Date(userData.created_at),
          updatedAt: new Date(userData.updated_at),
        };

        // Use findUnique to check if the user already exists based on username
        const existingUser = await prisma.users.findUnique({
          where: { username: formattedUser.username },
        });

        if (existingUser) {
          // Update existing user
          return await prisma.users.update({
            where: { username: formattedUser.username },
            data: formattedUser,
          });
        } else {
          // Create new user with auto-generated ID
          return await prisma.users.create({
            data: formattedUser,
          });
        }
      })
    );

    return NextResponse.json({
      status: 'success',
      message: `Successfully processed ${results.length} users`,
      data: results,
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
