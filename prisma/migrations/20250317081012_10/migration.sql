/*
  Warnings:

  - You are about to drop the column `payment_code_midtrans` on the `methods` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "methods" DROP COLUMN "payment_code_midtrans",
ADD COLUMN     "max" INTEGER,
ADD COLUMN     "maxExpired" INTEGER DEFAULT 0,
ADD COLUMN     "min" INTEGER,
ADD COLUMN     "minExpired" INTEGER DEFAULT 0,
ADD COLUMN     "payment_code_tripay" TEXT,
ADD COLUMN     "taxAdmin" INTEGER,
ADD COLUMN     "typeTax" TEXT;
