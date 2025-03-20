/*
  Warnings:

  - You are about to drop the column `account_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `layanan_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `server_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `invoice_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_layanan_id_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "account_id",
DROP COLUMN "category_id",
DROP COLUMN "layanan_id",
DROP COLUMN "server_id";

-- DropTable
DROP TABLE "invoice_items";

-- CreateTable
CREATE TABLE "pembelian" (
    "id" SERIAL NOT NULL,
    "order_id" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255),
    "zone" VARCHAR(255),
    "nickname" VARCHAR(255),
    "email_vilog" TEXT,
    "password_vilog" TEXT,
    "loginvia_vilog" TEXT,
    "layanan" VARCHAR(255) NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "provider_order_id" VARCHAR(255),
    "status" VARCHAR(255) NOT NULL,
    "log" VARCHAR(1000),
    "sn" VARCHAR(255),
    "tipe_transaksi" VARCHAR(255) NOT NULL,
    "game" VARCHAR(255) NOT NULL,
    "is_digi" BOOLEAN NOT NULL DEFAULT false,
    "ref_id" VARCHAR(255),
    "success_report_sended" BOOLEAN NOT NULL DEFAULT false,
    "transaction_id" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pembelian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pembelian_order_id_idx" ON "pembelian"("order_id");

-- CreateIndex
CREATE INDEX "pembelian_user_id_idx" ON "pembelian"("user_id");

-- CreateIndex
CREATE INDEX "pembelian_transaction_id_idx" ON "pembelian"("transaction_id");

-- AddForeignKey
ALTER TABLE "pembelian" ADD CONSTRAINT "pembelian_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembelian" ADD CONSTRAINT "pembelian_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
