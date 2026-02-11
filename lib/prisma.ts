import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pool: Pool;
};

const connectionString = process.env.DATABASE_URL || 'postgresql://topik_user:topik_password@localhost:5432/topik_learning_db?schema=public';

const pool = globalForPrisma.pool || new Pool({ connectionString });
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper functions to replace Dexie operations
export class PrismaDatabase {
  // Vocabulary operations
  static async addVocabulary(items: any[]) {
    return await prisma.vocabulary.createMany({
      data: items.map(item => ({
        id: item.id,
        stt: item.stt,
        ko: item.ko,
        vi: item.vi,
        tags: item.tags || [],
        addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
      })),
      skipDuplicates: true,
    });
  }

  static async getVocabulary() {
    return await prisma.vocabulary.findMany({
      orderBy: { addedAt: 'desc' },
    });
  }

  static async getVocabularyById(id: string) {
    return await prisma.vocabulary.findUnique({
      where: { id },
      include: { progress: true },
    });
  }

  static async updateVocabulary(id: string, updates: any) {
    return await prisma.vocabulary.update({
      where: { id },
      data: updates,
    });
  }

  static async deleteVocabulary(id: string) {
    return await prisma.vocabulary.delete({
      where: { id },
    });
  }

  static async searchVocabulary(query: string) {
    return await prisma.vocabulary.findMany({
      where: {
        OR: [
          { ko: { contains: query, mode: 'insensitive' } },
          { vi: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  // Progress operations
  static async getProgress(vocabId: string) {
    return await prisma.vocabProgress.findUnique({
      where: { vocabId },
    });
  }

  static async updateProgress(progress: any) {
    return await prisma.vocabProgress.upsert({
      where: { vocabId: progress.vocabId },
      update: {
        easeFactor: progress.easeFactor,
        intervalDays: progress.intervalDays,
        repetitions: progress.repetitions,
        dueDate: new Date(progress.dueDate),
        correctAnswers: progress.correctAnswers,
        wrongAnswers: progress.wrongAnswers,
        lastStudied: progress.lastStudied ? new Date(progress.lastStudied) : null,
      },
      create: {
        vocabId: progress.vocabId,
        easeFactor: progress.easeFactor,
        intervalDays: progress.intervalDays,
        repetitions: progress.repetitions,
        dueDate: new Date(progress.dueDate),
        correctAnswers: progress.correctAnswers,
        wrongAnswers: progress.wrongAnswers,
        lastStudied: progress.lastStudied ? new Date(progress.lastStudied) : null,
      },
    });
  }

  static async getDueVocabulary() {
    return await prisma.vocabProgress.findMany({
      where: {
        dueDate: { lte: new Date() },
      },
      include: {
        vocabulary: true,
      },
    });
  }

  static async getAllProgress() {
    return await prisma.vocabProgress.findMany({
      include: {
        vocabulary: true,
      },
    });
  }

  // Game results operations
  static async addGameResult(result: any) {
    return await prisma.gameResult.create({
      data: {
        gameType: result.gameType,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeSpent: result.timeSpent,
        playedAt: result.playedAt ? new Date(result.playedAt) : new Date(),
      },
    });
  }

  static async getGameResults(gameType?: string) {
    return await prisma.gameResult.findMany({
      where: gameType ? { gameType } : undefined,
      orderBy: { playedAt: 'desc' },
    });
  }

  static async getRecentGameResults(limit: number = 10) {
    return await prisma.gameResult.findMany({
      take: limit,
      orderBy: { playedAt: 'desc' },
    });
  }

  // User stats operations
  static async getUserStats() {
    let stats = await prisma.userStats.findUnique({
      where: { id: 'main' },
    });

    if (!stats) {
      stats = await prisma.userStats.create({
        data: {
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
    }

    return stats;
  }

  static async updateUserStats(updates: any) {
    return await prisma.userStats.update({
      where: { id: 'main' },
      data: updates,
    });
  }

  // User settings operations
  static async getUserSettings() {
    let settings = await prisma.userSettings.findUnique({
      where: { id: 'main' },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          id: 'main',
          theme: 'light',
          audioEnabled: true,
          audioRate: 1.0,
          audioPitch: 1.0,
          autoplay: false,
          language: 'vi',
        },
      });
    }

    return settings;
  }

  static async updateUserSettings(updates: any) {
    return await prisma.userSettings.update({
      where: { id: 'main' },
      data: updates,
    });
  }

  // Study session operations
  static async createStudySession(session: any) {
    return await prisma.studySession.create({
      data: session,
    });
  }

  static async getStudySessions(userId: string = 'default', limit?: number) {
    return await prisma.studySession.findMany({
      where: { userId },
      take: limit,
      orderBy: { sessionDate: 'desc' },
    });
  }

  static async updateStudySession(id: number, updates: any) {
    return await prisma.studySession.update({
      where: { id },
      data: updates,
    });
  }
}

export default prisma;
