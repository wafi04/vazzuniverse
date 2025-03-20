// Tipe untuk `dailyTransactions`
interface DailyTransaction {
    date: string; // Format ISO string
    count: string; // Jumlah transaksi (disimpan sebagai string)
    revenue: string; // Pendapatan (disimpan sebagai string)
    pending_count: string; // Jumlah transaksi dengan status "PENDING"
    paid_count: string; // Jumlah transaksi dengan status "PAID"
    process_count: string; // Jumlah transaksi dengan status "PROCESS"
    success_count: string; // Jumlah transaksi dengan status "SUCCESS"
    failed_count: string; // Jumlah transaksi dengan status "FAILED"
  }
  
  // Tipe untuk `growth`
  interface Growth {
    transactions: number;
    revenue: number;
    successRate: number;
    activeUsers: number;
  }
  
  // Tipe untuk elemen dalam `transactionsByStatus` dan `statusDistribution`
  interface TransactionStatus {
    status: string; // Status transaksi (e.g., "PENDING", "PAID")
    count: number; // Jumlah transaksi dengan status ini
    amount: number; // Total jumlah uang terkait status ini
    percentage?: number; // Persentase (hanya ada di `statusDistribution`)
  }
  
  // Tipe untuk elemen dalam `recentTransactions`
  interface RecentTransaction {
    id: number;
    merchantOrderId: string;
    userId: number | null;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    voucherId: number | null;
    qrString: string | null;
    paymentStatus: string; // Status pembayaran (e.g., "SUCCESS", "FAILED")
    paymentCode: string;
    paymentReference: string | null;
    paymentUrl: string | null;
    noWa: string;
    statusMessage: string;
    completedAt: string | null;
    createdAt: string; // Format ISO string
    updatedAt: string; // Format ISO string
    transactionType: string; // Jenis transaksi (e.g., "Top up")
    pembelian: Array<{
      id: number;
      order_id: string;
      username: string;
      user_id: number | null;
      zone: string;
      nickname: string;
      email_vilog: string | null;
      password_vilog: string | null;
      loginvia_vilog: string | null;
      layanan: string;
      accountID: string;
      harga: number;
      profit: number;
      provider_order_id: string;
      status: string; // Status pembelian
      log: string | null;
      sn: string | null;
      tipe_transaksi: string;
      game: string;
      is_digi: boolean;
      ref_id: string | null;
      success_report_sended: boolean;
      transaction_id: number;
      created_at: string; // Format ISO string
      updated_at: string; // Format ISO string
    }>;
    user: any | null; // Asumsi sementara, bisa diganti jika ada struktur lebih spesifik
  }
  
  // Tipe utama untuk seluruh data
  export interface TransactionDashboardData {
    totalTransactions: number;
    totalRevenue: number;
    successRate: number;
    activeUsers: number;
    growth: Growth;
    transactionsByStatus: TransactionStatus[];
    statusDistribution: TransactionStatus[];
    recentTransactions: RecentTransaction[];
    dailyTransactions: DailyTransaction[];
  }