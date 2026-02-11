import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const vocabularyCount = await prisma.vocabulary.count();
    const userStats = await prisma.userStats.findUnique({ where: { id: 'main' } });
    const userSettings = await prisma.userSettings.findUnique({ where: { id: 'main' } });

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        vocabularyCount,
        userStats,
        userSettings,
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
