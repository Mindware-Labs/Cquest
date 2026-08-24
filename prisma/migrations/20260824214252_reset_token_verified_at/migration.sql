/*
  Warnings:

  - You are about to drop the column `sessionTokenHash` on the `PasswordResetToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PasswordResetToken_sessionTokenHash_key";

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP COLUMN "sessionTokenHash",
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
