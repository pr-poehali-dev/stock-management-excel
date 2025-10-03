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
  const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockItems = stockData.filter(item => item.quantity < item.minStock).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 hover-scale">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Всего товаров</p>
            <p className="text-3xl font-bold mt-2">{stockData.reduce((sum, item) => sum + item.quantity, 0)}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Package" size={24} className="text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 hover-scale">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Стоимость склада</p>
            <p className="text-3xl font-bold mt-2">{(totalValue / 1000000).toFixed(1)}М ₽</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Icon name="Wallet" size={24} className="text-secondary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 hover-scale">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Мало на складе</p>
            <p className="text-3xl font-bold mt-2">{lowStockItems}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="AlertTriangle" size={24} className="text-accent" />
          </div>
        </div>
      </Card>

      <Card className="p-6 hover-scale">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Операций сегодня</p>
            <p className="text-3xl font-bold mt-2">24</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Icon name="TrendingUp" size={24} className="text-destructive" />
          </div>
        </div>
      </Card>
    </div>
  );
}
