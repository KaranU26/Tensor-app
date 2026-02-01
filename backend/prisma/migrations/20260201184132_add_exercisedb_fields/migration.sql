/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `exercises` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "exercises" ADD COLUMN "body_part" TEXT;
ALTER TABLE "exercises" ADD COLUMN "equipment" TEXT;
ALTER TABLE "exercises" ADD COLUMN "external_id" TEXT;
ALTER TABLE "exercises" ADD COLUMN "gif_url" TEXT;
ALTER TABLE "exercises" ADD COLUMN "target" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "exercises_external_id_key" ON "exercises"("external_id");

-- CreateIndex
CREATE INDEX "exercises_body_part_idx" ON "exercises"("body_part");

-- CreateIndex
CREATE INDEX "exercises_target_idx" ON "exercises"("target");
