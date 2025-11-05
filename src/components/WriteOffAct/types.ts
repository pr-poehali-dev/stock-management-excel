export interface StockItem {
  id?: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface ActItem {
  product: StockItem | null;
  quantity: number;
  reason: string;
}

export interface ActData {
  actNumber: string;
  date: string;
  responsible: string;
  commission: string;
  commissionMembers: string[];
}