#!/bin/bash

echo "🧪 Testing Database and API..."
echo ""

# Test 1: Check Docker containers
echo "1️⃣ Checking Docker containers..."
docker compose ps

echo ""
echo "2️⃣ Testing database connection directly..."
docker exec topik-postgres psql -U topik_user -d topik_learning_db -c "SELECT COUNT(*) as vocabulary_count FROM vocabulary;" 2>/dev/null

echo ""
echo "3️⃣ Checking user stats..."
docker exec topik-postgres psql -U topik_user -d topik_learning_db -c "SELECT * FROM user_stats;" 2>/dev/null

echo ""
echo "4️⃣ Testing Prisma connection..."
cd "$(dirname "$0")"
npx tsx << 'EOF'
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://topik_user:topik_password@localhost:5432/topik_learning_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const count = await prisma.vocabulary.count();
    const stats = await prisma.userStats.findUnique({ where: { id: 'main' } });
    
    console.log('\n✅ Prisma connection successful!');
    console.log(`📚 Vocabulary count: ${count}`);
    console.log(`📊 User stats: Level ${stats?.level}, XP ${stats?.xp}`);
    
    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    process.exit(1);
  }
}

test();
EOF

echo ""
echo "✅ All tests completed!"
