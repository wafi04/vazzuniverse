/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `pembelian` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pembelian_order_id_key" ON "pembelian"("order_id");
