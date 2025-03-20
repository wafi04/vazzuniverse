import { Check, CreditCard, Package, Loader2 } from 'lucide-react';
import { Pembelian } from './pembelians';
import { User } from './schema/user';

// Assuming FLOWTRANSACTION is a type with these possible values
export type FLOWTRANSACTION =
  | 'PENDING'
  | 'PAID'
  | 'PROCESS'
  | 'SUCCESS'
  | 'FAILED';
export const stepsTransaction = [
  {
    id: 'PENDING',
    label: 'Transaksi telah Dibuat',
    description: 'Transaksi telah berhasil dibuat',
    icon: Check,
  },
  {
    id: 'PAID',
    label: 'Pembayaran',
    description: 'Silahkan melakukan pembayaran',
    icon: CreditCard,
  },
  {
    id: 'PROCESS',
    label: 'Sedang Di Proses',
    description: 'Pembelian sedang dalam proses',
    icon: Loader2,
  },
  {
    id: 'SUCCESS',
    label: 'Transaksi Selesai',
    description: 'Transaksi telah Berhasil Dilakukan',
    icon: Package,
  },
  {
    id: 'Failed',
    label: 'Transaksi Gagal',
    description: 'Transaksi telah Berhasil Dilakukan',
    icon: Package,
  },
];

[
  {
      "id": 75,
      "merchantOrderId": "DEP-1742351880649-cm8bi8gb80000jr03ximzxg7d",
      "userId": null,
      "originalAmount": 500000,
      "discountAmount": 0,
      "finalAmount": 500000,
      "voucherId": null,
      "qrString": null,
      "paymentStatus": "FAILED",
      "paymentCode": "FT",
      "paymentReference": null,
      "paymentUrl": null,
      "noWa": "6282226197047",
      "statusMessage": null,
      "completedAt": null,
      "createdAt": "2025-03-19T02:38:00.709Z",
      "updatedAt": "2025-03-19T02:38:02.170Z",
      "transactionType": "DEPOSIT",
      "invoice": [],
      "user": null
  },
  {
      "id": 73,
      "merchantOrderId": "DEP-1742351420598-cm8bi8gb80000jr03ximzxg7d",
      "userId": null,
      "originalAmount": 10000,
      "discountAmount": 0,
      "finalAmount": 10000,
      "voucherId": null,
      "qrString": null,
      "paymentStatus": "FAILED",
      "paymentCode": "FT",
      "paymentReference": null,
      "paymentUrl": null,
      "noWa": "6282226197047",
      "statusMessage": null,
      "completedAt": null,
      "createdAt": "2025-03-19T02:30:20.638Z",
      "updatedAt": "2025-03-19T02:30:21.639Z",
      "transactionType": "DEPOSIT",
      "invoice": [],
      "user": null
  },
  {
      "id": 72,
      "merchantOrderId": "DEP-1742351399486-cm8bi8gb80000jr03ximzxg7d",
      "userId": null,
      "originalAmount": 10000,
      "discountAmount": 0,
      "finalAmount": 10000,
      "voucherId": null,
      "qrString": null,
      "paymentStatus": "FAILED",
      "paymentCode": "FT",
      "paymentReference": null,
      "paymentUrl": null,
      "noWa": "6282226197047",
      "statusMessage": null,
      "completedAt": null,
      "createdAt": "2025-03-19T02:29:59.546Z",
      "updatedAt": "2025-03-19T02:30:01.041Z",
      "transactionType": "DEPOSIT",
      "invoice": [],
      "user": null
  },
  {
      "id": 48,
      "merchantOrderId": "ORD-1742290306727-a1t64o",
      "userId": null,
      "originalAmount": 1027,
      "discountAmount": 0,
      "finalAmount": 1027,
      "voucherId": null,
      "qrString": null,
      "paymentStatus": "FAILED",
      "paymentCode": "DA",
      "paymentReference": null,
      "paymentUrl": null,
      "noWa": "082226197047",
      "statusMessage": "Failed to generate Payment URL Dana",
      "completedAt": null,
      "createdAt": "2025-03-18T09:31:46.875Z",
      "updatedAt": "2025-03-18T09:31:48.472Z",
      "transactionType": "Top up",
      "invoice": [],
      "user": null
  }
]

export interface Transaction {
  id: number;
  merchantOrderId: string;
  userId: string | null;
  layananId: number | null;
  categoryId: number | null;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucherId: number | null;
  paymentStatus: string | null;
  paymentCode: string;
  paymentReference: string | null;
  paymentUrl: string | null;
  layananName: string;
  noWa: string;
  statusMessage: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  qrString: string | null;
  transactionType: string;
  categoryName: string;
}

export type TransactionPesanan = {
  id: number;
  merchantOrderId: string; // The order ID should be a string
  userId: number | null; // Nullable userId
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucherId: string | null; // Nullable voucherId
  qrString: string | null; // Nullable qrString
  paymentStatus: "FAILED" | "SUCCESS" | "PENDING"  | "PAID"; // Enum for payment status
  paymentCode: string;
  paymentReference: string | null; // Nullable paymentReference
  paymentUrl: string | null; // Nullable paymentUrl
  noWa: string; // WhatsApp number, usually a string
  statusMessage: string | null; // Nullable statusMessage
  completedAt: string | null; // Nullable completedAt, ISO string format or null
  createdAt: string; // ISO string format for createdAt
  updatedAt: string; // ISO string format for updatedAt
  transactionType: string
  invoice: Invoice[]; // Assuming this could be any type of array
  user: User | null; // Nullable user field, could be an object or null
};


export type TransactionWithUser = Transaction & {
  layanan: {
    layanan: string | null;
  } | null; // Allow layanan to be null
  category: {
    name: string | null;
  } | null;
  user: {
    name: string | null;
    username: string;
    id: string;
    whatsapp: string;
  } | null;
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  notes: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  paymentDate: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  transactionId: number;
  termsAndConditions: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type TransactionDetailsType = {
  id: number;
  categoryId?: number;
  layananId?: number;
  merchantOrderId: string;
  noWa: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentCode: string;
  paymentReference: string;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'PAID' | 'PROCESS';
  paymentUrl: string;
  qrString: string | null;
  statusMessage: string | null;
  transactionType: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  voucherId: string | null;
  invoice: Invoice[];
  accountId?: string;
  serverId?: string | null;
  pembelian: Pembelian[];
};
export type TransactionAll = {
  totalCount: number;
  transactions: TransactionWithUser[];
};
