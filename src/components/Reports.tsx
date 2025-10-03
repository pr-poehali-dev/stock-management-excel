import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";

const MOVEMENTS_API = 'https://functions.poehali.dev/178c4661-b69a-4921-8960-35d7db62c2d5';

interface Movement {
  id?: number;
  date: string;
  product: string;
  type: string;
  quantity: number;
  user: string;
  reason?: string;
  notes?: string;
}

interface StockItem {
  id?: number;
  name: string;
  inventory_number: string;
  quantity: number;
}

interface ReportsProps {
  stockData: StockItem[];
}

export function Reports({ stockData }: ReportsProps) {
  const { toast } = useToast();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    productId: 'all',
    movementType: 'all'
  });

  useEffect(() => {
    loadMovements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  const loadMovements = async () => {
    try {
      const response = await fetch(MOVEMENTS_API);
      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

    if (filters.startDate) {
      filtered = filtered.filter(m => new Date(m.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(m => new Date(m.date) <= new Date(filters.endDate));
    }

    if (filters.productId !== 'all') {
      const product = stockData.find(p => p.id?.toString() === filters.productId);
      if (product) {
        filtered = filtered.filter(m => m.product === product.name);
      }
    }

    if (filters.movementType !== 'all') {
      filtered = filtered.filter(m => m.type === filters.movementType);
    }

    setFilteredMovements(filtered);
  };

  const getChartData = () => {
    const groupedByDate: Record<string, { date: string; incoming: number; outgoing: number }> = {};

    filteredMovements.forEach(movement => {
      const dateKey = new Date(movement.date).toLocaleDateString('ru-RU');
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey, incoming: 0, outgoing: 0 };
      }

      if (movement.type === 'Поступление') {
        groupedByDate[dateKey].incoming += Math.abs(movement.quantity);
      } else {
        groupedByDate[dateKey].outgoing += Math.abs(movement.quantity);
      }
    });

    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date.split('.').reverse().join('-')).getTime() - 
      new Date(b.date.split('.').reverse().join('-')).getTime()
    );
  };

  const getTotalStats = () => {
    const stats = {
      totalIncoming: 0,
      totalOutgoing: 0,
      balance: 0
    };

    filteredMovements.forEach(movement => {
      if (movement.type === 'Поступление') {
        stats.totalIncoming += Math.abs(movement.quantity);
      } else {
        stats.totalOutgoing += Math.abs(movement.quantity);
      }
    });

    stats.balance = stats.totalIncoming - stats.totalOutgoing;

    return stats;
  };

  const exportToCSV = () => {
    const headers = ['Дата', 'Товар', 'Тип операции', 'Количество', 'Пользователь', 'Причина', 'Примечание'];
    const rows = filteredMovements.map(m => [
      m.date,
      m.product,
      m.type,
      m.quantity,
      m.user,
      m.reason || '',
      m.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `отчет_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Отчёт экспортирован",
      description: "CSV файл успешно сохранён"
    });
  };

  const printReport = () => {
    window.print();
  };

  const stats = getTotalStats();
  const chartData = getChartData();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Отчёты по движению товаров</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Icon name="Download" size={16} />
              Экспорт CSV
            </Button>
            <Button variant="outline" onClick={printReport} className="gap-2">
              <Icon name="Printer" size={16} />
              Печать
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div>
            <Label>Дата с</Label>
            <Input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Дата по</Label>
            <Input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Товар</Label>
            <Select value={filters.productId} onValueChange={(val) => setFilters({ ...filters, productId: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Все товары" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все товары</SelectItem>
                {stockData.map((item) => (
                  <SelectItem key={item.id} value={item.id?.toString() || ''}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Тип операции</Label>
            <Select value={filters.movementType} onValueChange={(val) => setFilters({ ...filters, movementType: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Все операции" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все операции</SelectItem>
                <SelectItem value="Поступление">Поступление</SelectItem>
                <SelectItem value="Списание">Списание</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="p-4 bg-secondary/5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Icon name="ArrowDown" className="text-secondary" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Поступило</p>
                <p className="text-2xl font-bold text-secondary">+{stats.totalIncoming}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-destructive/5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Icon name="ArrowUp" className="text-destructive" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Списано</p>
                <p className="text-2xl font-bold text-destructive">-{stats.totalOutgoing}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="TrendingUp" className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Баланс</p>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                  {stats.balance >= 0 ? '+' : ''}{stats.balance}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {chartData.length > 0 && (
          <Card className="p-6 mb-6">
            <h4 className="text-md font-semibold mb-4">График движения</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="incoming" stroke="#10B981" name="Поступление" strokeWidth={2} />
                <Line type="monotone" dataKey="outgoing" stroke="#EF4444" name="Списание" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card className="p-6">
          <h4 className="text-md font-semibold mb-4">Детализация операций</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Тип операции</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Причина</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(movement.date).toLocaleString('ru-RU')}</TableCell>
                    <TableCell className="font-medium">{movement.product}</TableCell>
                    <TableCell>
                      <Badge variant={movement.type === "Поступление" ? "default" : "destructive"}>
                        {movement.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={movement.quantity > 0 ? "text-secondary" : "text-destructive"}>
                      {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                    </TableCell>
                    <TableCell>{movement.user}</TableCell>
                    <TableCell className="text-muted-foreground">{movement.reason || '—'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Нет данных за выбранный период
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Card>
    </div>
  );
}