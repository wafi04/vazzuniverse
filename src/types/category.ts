export type Category = {
  id: number;
  name: string;
  subName: string;
  brand: string;
  kode: string | null;
  serverId: number;
  status: string;
  thumbnail: string;
  type: string;
  instruction: string | null;
  ketLayanan: string | null;
  ketId: string | null;
  placeholder1: string;
  placeholder2: string;
  createdAt: string;
  updatedAt: string;
  bannerLayanan: string;
};

export type SubCategories = {
  name: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  code: string;
  categoriesId: number;
  active: boolean;
};

export type PlansProps = {
  id: number;
  subCategoryId: number;
  providerId: string;
  layanan: string;
  harga: number;
  hargaFlashSale : number
  isFlashSale : boolean
};
