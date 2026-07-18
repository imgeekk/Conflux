-- AlterTable
ALTER TABLE "Chunk" ADD COLUMN     "answerId" TEXT,
ALTER COLUMN "documentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
