-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "whatsapp" VARCHAR(50) NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "api_key" TEXT,
    "otp" TEXT,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategoris" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "sub_nama" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "kode" TEXT,
    "server_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "petunjuk" TEXT,
    "ket_layanan" TEXT,
    "ket_id" TEXT,
    "placeholder_1" TEXT NOT NULL,
    "placeholder_2" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "bannerlayanan" TEXT NOT NULL,

    CONSTRAINT "kategoris_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_categories" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beritas" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beritas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "methods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "payment_type" TEXT,
    "payment_code_midtrans" TEXT,
    "keterangan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layanans" (
    "id" SERIAL NOT NULL,
    "kategori_id" TEXT NOT NULL,
    "sub_category_id" INTEGER NOT NULL,
    "layanan" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "harga_reseller" INTEGER NOT NULL,
    "harga_platinum" INTEGER NOT NULL,
    "harga_gold" INTEGER NOT NULL,
    "harga_flash_sale" INTEGER DEFAULT 0,
    "profit" INTEGER NOT NULL,
    "profit_reseller" INTEGER NOT NULL,
    "profit_platinum" INTEGER NOT NULL,
    "profit_gold" INTEGER NOT NULL,
    "is_flash_sale" BOOLEAN NOT NULL DEFAULT false,
    "judul_flash_sale" TEXT,
    "banner_flash_sale" TEXT,
    "expired_flash_sale" TIMESTAMP(3),
    "catatan" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "provider" TEXT NOT NULL,
    "product_logo" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "layanans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "maxDiscount" DOUBLE PRECISION,
    "minPurchase" DOUBLE PRECISION,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "is_for_all_categories" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_categories" (
    "id" SERIAL NOT NULL,
    "voucher_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "voucher_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "merchant_order_id" TEXT NOT NULL,
    "user_id" TEXT,
    "layanan_id" INTEGER,
    "category_id" INTEGER,
    "original_amount" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "final_amount" DOUBLE PRECISION NOT NULL,
    "voucher_id" INTEGER,
    "qr_string" TEXT,
    "payment_status" TEXT NOT NULL,
    "payment_code" TEXT NOT NULL,
    "payment_reference" TEXT,
    "account_id" TEXT,
    "server_id" TEXT,
    "payment_url" TEXT,
    "no_wa" TEXT NOT NULL,
    "status_message" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "transaction_type" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "transaction_id" INTEGER,
    "user_id" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "payment_date" TIMESTAMP(3),
    "notes" TEXT,
    "terms_and_conditions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setting_webs" (
    "id" SERIAL NOT NULL,
    "judul_web" TEXT NOT NULL,
    "deskripsi_web" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "og_image" TEXT,
    "logo_header" TEXT,
    "logo_footer" TEXT,
    "logo_favicon" TEXT,
    "logo_banner" TEXT,
    "logo_cs" TEXT,
    "url_wa" TEXT NOT NULL,
    "url_ig" TEXT NOT NULL,
    "url_tiktok" TEXT NOT NULL,
    "url_youtube" TEXT NOT NULL,
    "url_fb" TEXT NOT NULL,
    "kbrstore_api" TEXT NOT NULL,
    "slogan_web" TEXT NOT NULL,
    "snk" TEXT NOT NULL,
    "privacy" TEXT NOT NULL,
    "warna1" TEXT NOT NULL,
    "warna2" TEXT NOT NULL,
    "warna3" TEXT NOT NULL,
    "warna4" TEXT NOT NULL,
    "warna5" TEXT NOT NULL,
    "harga_gold" TEXT NOT NULL,
    "harga_platinum" TEXT NOT NULL,
    "tripay_api" TEXT,
    "tripay_merchant_code" TEXT,
    "tripay_private_key" TEXT,
    "duitku_key" TEXT,
    "duitku_merchant" TEXT,
    "username_digi" TEXT,
    "api_key_digi" TEXT,
    "apigames_secret" TEXT,
    "apigames_merchant" TEXT,
    "vip_apiid" TEXT,
    "vip_apikey" TEXT,
    "digi_seller_user" TEXT,
    "digi_seller_key" TEXT,
    "nomor_admin" TEXT,
    "wa_key" TEXT,
    "wa_number" TEXT,
    "ovo_admin" TEXT,
    "ovo1_admin" TEXT,
    "gopay_admin" TEXT,
    "gopay1_admin" TEXT,
    "dana_admin" TEXT,
    "shopeepay_admin" TEXT,
    "bca_admin" TEXT,
    "mandiri_admin" TEXT,
    "logo_ceo" TEXT,
    "sejarah" TEXT NOT NULL,
    "sejarah_1" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "nama_ceo" TEXT NOT NULL,
    "deskripsi_ceo" TEXT NOT NULL,
    "nama_bagan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "setting_webs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "kategoris_kode_nama_idx" ON "kategoris"("kode", "nama");

-- CreateIndex
CREATE INDEX "sub_categories_category_id_idx" ON "sub_categories"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_categories_voucher_id_category_id_key" ON "voucher_categories"("voucher_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_merchant_order_id_key" ON "transactions"("merchant_order_id");

-- CreateIndex
CREATE INDEX "transactions_merchant_order_id_idx" ON "transactions"("merchant_order_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_payment_status_idx" ON "transactions"("payment_status");

-- CreateIndex
CREATE INDEX "transactions_voucher_id_idx" ON "transactions"("voucher_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_user_id_idx" ON "invoices"("user_id");

-- CreateIndex
CREATE INDEX "invoices_transaction_id_idx" ON "invoices"("transaction_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "deposits_username_idx" ON "deposits"("username");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_categories" ADD CONSTRAINT "voucher_categories_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_categories" ADD CONSTRAINT "voucher_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "kategoris"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_layanan_id_fkey" FOREIGN KEY ("layanan_id") REFERENCES "layanans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "kategoris"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
