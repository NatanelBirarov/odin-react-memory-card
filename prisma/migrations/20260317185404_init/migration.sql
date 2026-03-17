/*
  Warnings:

  - A unique constraint covering the columns `[userId,setId]` on the table `LevelData` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LevelData_setId_key";

-- CreateIndex
CREATE UNIQUE INDEX "LevelData_userId_setId_key" ON "LevelData"("userId", "setId");
