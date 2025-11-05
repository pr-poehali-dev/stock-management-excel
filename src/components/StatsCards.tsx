import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface StockItem {
  quantity: number;
  price: number;
  minStock: number;
}

interface StatsCardsProps {
  stockData: StockItem[];
}

export function StatsCards({ stockData }: StatsCardsProps) {
  if (!stockData || stockData.length === 0) {
    return (
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Товаров:</span>
          <span className="font-semibold">0</span>
        </div>
        <div className="h-4 w-px bg-border"></div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Стоимость:</span>
          <span className="font-semibold">0М ₽</span>
        </div>
        <div className="h-4 w-px bg-border"></div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Мало:</span>
          <span className="font-semibold text-red-600">0</span>
        </div>
      </div>
    );
  }

  const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockItems = stockData.filter(item => item.quantity < item.minStock).length;

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">Товаров:</span>
        <span className="font-semibold">{stockData.reduce((sum, item) => sum + item.quantity, 0)}</span>
      </div>
      <div className="h-4 w-px bg-border"></div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">Стоимость:</span>
        <span className="font-semibold">{(totalValue / 1000000).toFixed(1)}М ₽</span>
      </div>
      <div className="h-4 w-px bg-border"></div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">Мало:</span>
        <span className="font-semibold text-red-600">{lowStockItems}</span>
      </div>
    </div>
  );
}