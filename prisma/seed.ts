import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || 'postgresql://topik_user:topik_password@localhost:5432/topik_learning_db?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default user stats
  const userStats = await prisma.userStats.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      totalWordsLearned: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalGamesPlayed: 0,
      averageAccuracy: 0,
      totalTimeSpent: 0,
      level: 1,
      xp: 0,
    },
  });

  // Create default user settings
  const userSettings = await prisma.userSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      theme: 'light',
      audioEnabled: true,
      audioRate: 1.0,
      audioPitch: 1.0,
      autoplay: false,
      language: 'vi',
    },
  });

  // Sample vocabulary data (you can customize this)
  const sampleVocab = [
    { id: 'vocab-1', ko: '안녕하세요', vi: 'Xin chào', tags: ['greeting', 'basic'] },
    { id: 'vocab-2', ko: '감사합니다', vi: 'Cảm ơn', tags: ['greeting', 'basic'] },
    { id: 'vocab-3', ko: '미안합니다', vi: 'Xin lỗi', tags: ['greeting', 'basic'] },
    { id: 'vocab-4', ko: '네', vi: 'Vâng/Có', tags: ['basic', 'response'] },
    { id: 'vocab-5', ko: '아니요', vi: 'Không', tags: ['basic', 'response'] },
  ];

  // Insert sample vocabulary
  for (const vocab of sampleVocab) {
    await prisma.vocabulary.upsert({
      where: { id: vocab.id },
      update: {},
      create: vocab,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`- Created user stats: ${userStats.id}`);
  console.log(`- Created user settings: ${userSettings.id}`);
  console.log(`- Created ${sampleVocab.length} sample vocabulary items`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
