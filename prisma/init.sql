-- CreateTable
CREATE TABLE "vocabulary" (
    "id" TEXT NOT NULL,
    "stt" INTEGER,
    "ko" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocab_progress" (
    "vocabId" TEXT NOT NULL,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "lastStudied" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocab_progress_pkey" PRIMARY KEY ("vocabId")
);

-- CreateTable
CREATE TABLE "game_results" (
    "id" SERIAL NOT NULL,
    "gameType" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL,
    "totalWordsLearned" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "totalGamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "averageAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "audioEnabled" BOOLEAN NOT NULL DEFAULT true,
    "audioRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "audioPitch" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "autoplay" BOOLEAN NOT NULL DEFAULT false,
    "voice" TEXT,
    "language" TEXT NOT NULL DEFAULT 'vi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordsStudied" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "sessionType" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vocabulary_ko_idx" ON "vocabulary"("ko");

-- CreateIndex
CREATE INDEX "vocabulary_addedAt_idx" ON "vocabulary"("addedAt");

-- CreateIndex
CREATE INDEX "vocab_progress_dueDate_idx" ON "vocab_progress"("dueDate");

-- CreateIndex
CREATE INDEX "vocab_progress_vocabId_idx" ON "vocab_progress"("vocabId");

-- CreateIndex
CREATE INDEX "game_results_gameType_idx" ON "game_results"("gameType");

-- CreateIndex
CREATE INDEX "game_results_playedAt_idx" ON "game_results"("playedAt");

-- CreateIndex
CREATE INDEX "game_results_userId_idx" ON "game_results"("userId");

-- CreateIndex
CREATE INDEX "study_sessions_userId_idx" ON "study_sessions"("userId");

-- CreateIndex
CREATE INDEX "study_sessions_sessionDate_idx" ON "study_sessions"("sessionDate");

-- AddForeignKey
ALTER TABLE "vocab_progress" ADD CONSTRAINT "vocab_progress_vocabId_fkey" FOREIGN KEY ("vocabId") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
