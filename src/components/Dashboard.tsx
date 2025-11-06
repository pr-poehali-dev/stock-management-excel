import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatQuantity } from "@/utils/format";

interface StockItem {
  id?: number;
  name: string;
  inventory_number: string;
  quantity: number;
  minStock: number;
  price: number;
  status: string;
}

interface Movement {
  date: string;
  product: string;
  type: string;
  quantity: number;
  user: string;
}

interface ChartDataItem {
  month: string;
  incoming: number;
  outgoing: number;
}

interface DashboardProps {
  stockData: StockItem[];
  recentMovements: Movement[];
  chartData: ChartDataItem[];
}

export function Dashboard({ stockData, recentMovements, chartData }: DashboardProps) {
  const totalItems = stockData.length;
  const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockCount = stockData.filter(item => item.quantity <= item.minStock).length;
  const criticalStockCount = stockData.filter(item => item.quantity <= item.minStock / 2).length;
  const outOfStockCount = stockData.filter(item => item.quantity === 0).length;

  const topItems = [...stockData]
    .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
    .slice(0, 5);

  const recentActivity = recentMovements.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего товаров</p>
              <p className="text-3xl font-bold mt-2">{totalItems}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon name="Package" className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Общая стоимость</p>
              <p className="text-3xl font-bold mt-2">{totalValue.toFixed(0)} ₽</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="DollarSign" className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Низкий остаток</p>
              <p className="text-3xl font-bold mt-2">{lowStockCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Icon name="AlertCircle" className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Критический остаток</p>
              <p className="text-3xl font-bold mt-2">{criticalStockCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Icon name="AlertTriangle" className="text-red-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Движения по месяцам</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="incoming" fill="#10B981" name="Поступление" />
              <Bar dataKey="outgoing" fill="#EF4444" name="Списание" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Топ-5 товаров по стоимости</h3>
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.inventory_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{(item.quantity * item.price).toFixed(0)} ₽</p>
                  <p className="text-xs text-muted-foreground">{formatQuantity(item.quantity)} шт</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Последние движения</h3>
        <div className="space-y-3">
          {recentActivity.map((movement, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  movement.type === 'Поступление' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  <Icon 
                    name={movement.type === 'Поступление' ? 'ArrowDown' : 'ArrowUp'} 
                    className={movement.type === 'Поступление' ? 'text-green-600' : 'text-red-600'} 
                    size={16} 
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">{movement.product}</p>
                  <p className="text-xs text-muted-foreground">{movement.user}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={movement.type === 'Поступление' ? 'default' : 'destructive'}>
                  {movement.type === 'Поступление' ? '+' : '-'}{Math.abs(movement.quantity)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{movement.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {outOfStockCount > 0 && (
        <Card className="p-6 border-red-600 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 mb-2">
                Товары закончились
              </h3>
              <p className="text-sm text-red-700">
                {outOfStockCount} {outOfStockCount === 1 ? 'товар полностью' : 'товаров полностью'} отсутствует на складе. Требуется срочное пополнение.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
