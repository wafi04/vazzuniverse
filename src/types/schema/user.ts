export type User = {
  id: string; // Keep as number to match Prisma Int
  name: string | null;
  username: string;
  role: string;
  whatsapp: string | null;
  balance: string;
  apiKey: string | null;
  otp: string | null;
  createdAt: Date;
  updatedAt: Date;
};
