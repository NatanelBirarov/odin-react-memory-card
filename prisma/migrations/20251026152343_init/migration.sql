-- CreateTable
CREATE TABLE "GameData" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "completedLevels" INTEGER NOT NULL DEFAULT 0,
    "levels" INTEGER NOT NULL,
    "highScore" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "musicVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "sfxVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameData_setId_key" ON "GameData"("setId");
