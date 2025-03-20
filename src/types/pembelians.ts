export type Pembelian = {
  id: number;
  user_id: string;
  order_id: string;
  transaction_id: number;
  ref_id: string;
  provider_order_id: string | null;
  game: string;
  layanan: string;
  harga: number;
  profit: number;
  tipe_transaksi: string;
  status: string;
  success_report_sended: boolean;
  is_digi: boolean;
  sn: string | null;
  log: string | null;
  email_vilog: string | null;
  loginvia_vilog: string | null;
  password_vilog: string | null;
  nickname: string;
  username: string;
  zone: string;
  created_at: string;
  accountID  : string
  updated_at: string;
};

export type Pembelians = {
  pembelian: Pembelian[];
};
