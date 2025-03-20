import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://localhost:8000/api/settings');
    const data = await res.json();

    const webdata = data.data.web;

    // Create WebsiteConfig with required fields and data from API
    await prisma.websiteConfig.create({
      data: {
        // Required fields that aren't in your API response
        judul_web: webdata.judul_web || 'KBRSTORE TOPUP',
        deskripsi_web: webdata.deskripsi_web || '',
        keyword: webdata.keyword,
        slogan_web: webdata.slogan_web,
        snk: '',
        privacy: '',
        url_wa: '',
        url_ig: '',
        url_tiktok: '',
        url_youtube: '',
        url_fb: '',
        kbrstore_api: '',

        // Fields from your API response
        warna1: webdata.warna1,
        warna2: webdata.warna2,
        warna3: webdata.warna3,
        warna4: webdata.warna4,
        warna5: webdata.warna5,
        harga_gold: webdata.harga_gold,
        harga_platinum: webdata.harga_platinum,
        tripay_api: webdata.tripay_api,
        tripay_merchant_code: webdata.tripay_merchant_code,
        tripay_private_key: webdata.tripay_private_key,
        duitku_key: webdata.duitku_key,
        duitku_merchant: webdata.duitku_merchant,
        username_digi: webdata.username_digi,
        api_key_digi: webdata.api_key_digi,
        apigames_secret: webdata.apigames_secret,
        apigames_merchant: webdata.apigames_merchant,
        vip_apiid: webdata.vip_apiid,
        vip_apikey: webdata.vip_apikey,
        digi_seller_user: webdata.digi_seller_user,
        digi_seller_key: webdata.digi_seller_key,
        nomor_admin: webdata.nomor_admin,
        wa_key: webdata.wa_key,
        wa_number: webdata.wa_number,
        ovo_admin: webdata.ovo_admin,
        ovo1_admin: webdata.ovo1_admin,
        gopay_admin: webdata.gopay_admin,
        gopay1_admin: webdata.gopay1_admin,
        dana_admin: webdata.dana_admin,
        shopeepay_admin: webdata.shopeepay_admin,
        bca_admin: webdata.bca_admin,
        mandiri_admin: webdata.mandiri_admin,
        logo_ceo: webdata.logo_ceo,
        sejarah: webdata.sejarah,
        sejarah_1: webdata.sejarah_1,
        visi: webdata.visi,
        misi: webdata.misi,
        nama_ceo: webdata.nama_ceo,
        deskripsi_ceo: webdata.deskripsi_ceo,
        nama_bagan: webdata.nama_bagan,
        alamat: webdata.alamat,
        telp: webdata.telp,
        email: webdata.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Website config created successfully',
    });
  } catch (error) {
    console.error('Error creating website config:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
