-- AlterTable
ALTER TABLE "User"
ADD COLUMN "location" TEXT,
ADD COLUMN "favoriteInsect" TEXT,
ADD COLUMN "socialLinks" JSONB;

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_boardId_fkey";

-- AlterTable
ALTER TABLE "Post"
ADD COLUMN "profileOwnerId" UUID,
ALTER COLUMN "boardId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SavedPost" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedPost_userId_postId_key" ON "SavedPost"("userId", "postId");

-- CreateIndex
CREATE INDEX "SavedPost_postId_idx" ON "SavedPost"("postId");

-- CreateIndex
CREATE INDEX "SavedPost_userId_createdAt_idx" ON "SavedPost"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_profileOwnerId_createdAt_idx" ON "Post"("profileOwnerId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_profileOwnerId_fkey" FOREIGN KEY ("profileOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPost" ADD CONSTRAINT "SavedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddConstraint
ALTER TABLE "Post"
ADD CONSTRAINT "Post_destination_check" CHECK (num_nonnulls("boardId", "profileOwnerId") = 1);
