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
  actTitle: string;
  date: string;
  responsible: string;
  approvedBy: string[];
  commission: string;
  commissionMembers: string[];
  signers: Array<{
    position: string;
    name: string;
  }>;
}