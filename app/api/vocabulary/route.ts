import { NextResponse } from 'next/server';
import { PrismaDatabase } from '@/lib/prisma';

// GET /api/vocabulary - Lấy tất cả vocabulary
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    let vocabulary;
    if (query) {
      vocabulary = await PrismaDatabase.searchVocabulary(query);
    } else {
      vocabulary = await PrismaDatabase.getVocabulary();
    }

    return NextResponse.json({
      status: 'success',
      data: vocabulary,
      count: vocabulary.length,
    });
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch vocabulary',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/vocabulary - Thêm vocabulary mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid request body. Expected { items: VocabularyItem[] }',
        },
        { status: 400 }
      );
    }

    await PrismaDatabase.addVocabulary(items);

    return NextResponse.json({
      status: 'success',
      message: `Added ${items.length} vocabulary items`,
      count: items.length,
    });
  } catch (error) {
    console.error('Error adding vocabulary:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to add vocabulary',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
