-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "expertId" TEXT,
ADD COLUMN     "lowConfidence" BOOLEAN DEFAULT false;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
