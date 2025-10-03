import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { UserAddDialog, UsersTable } from "./UserManagement";
import { BarcodeScanner } from "./BarcodeScanner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MOVEMENTS_API = 'https://functions.poehali.dev/178c4661-b69a-4921-8960-35d7db62c2d5';

interface StockItem {
  id?: number;
  name: string;
  inventory_number: string;
  quantity: number;
  minStock: number;
  price: number;
  batch: string;
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

interface CategoryDataItem {
  name: string;
  value: number;
  color: string;
}

interface StockTabsProps {
  stockData: StockItem[];
  recentMovements: Movement[];
  chartData: ChartDataItem[];
  categoryData: CategoryDataItem[];
  isAdmin: boolean;
  onDataUpdate?: () => void;
}

export function StockTabs({ stockData, recentMovements, chartData, categoryData, isAdmin, onDataUpdate }: StockTabsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomingForm, setIncomingForm] = useState({
    product_id: '',
    quantity: 0,
    supplier: ''
  });
  const [outgoingForm, setOutgoingForm] = useState({
    product_id: '',
    quantity: 0,
    reason: '',
    notes: ''
  });

  const handleBarcodeIncoming = async (inventory_number: string, quantity: number) => {
    const product = stockData.find(item => item.inventory_number === inventory_number);
    if (!product?.id) return;

    try {
      const response = await fetch(MOVEMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          movement_type: 'Поступление',
          quantity: quantity,
          user_name: user?.name || 'Пользователь',
          supplier: 'Сканирование штрих-кода'
        })
      });

      if (response.ok) {
        onDataUpdate?.();
      }
    } catch (error) {
      console.error('Error processing barcode incoming:', error);
    }
  };

  const handleIncoming = async () => {
    if (!incomingForm.product_id || incomingForm.quantity <= 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(MOVEMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: parseInt(incomingForm.product_id),
          movement_type: 'Поступление',
          quantity: incomingForm.quantity,
          user_name: user?.name || 'Пользователь',
          supplier: incomingForm.supplier
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Поступление на ${incomingForm.quantity} шт проведено`
        });
        setIncomingForm({ product_id: '', quantity: 0, supplier: '' });
        onDataUpdate?.();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось провести поступление",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка при проведении операции",
        variant: "destructive"
      });
    }
  };

  const handleOutgoing = async () => {
    if (!outgoingForm.product_id || outgoingForm.quantity <= 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(MOVEMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: parseInt(outgoingForm.product_id),
          movement_type: 'Списание',
          quantity: outgoingForm.quantity,
          user_name: user?.name || 'Пользователь',
          reason: outgoingForm.reason,
          notes: outgoingForm.notes
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Списание на ${outgoingForm.quantity} шт проведено`
        });
        setOutgoingForm({ product_id: '', quantity: 0, reason: '', notes: '' });
        onDataUpdate?.();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось провести списание",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка при проведении операции",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Движение товаров</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="incoming" fill="#10B981" name="Поступление" />
                <Bar dataKey="outgoing" fill="#EF4444" name="Списание" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Распределение по категориям</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Последние операции</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Тип операции</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Пользователь</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMovements.length > 0 ? (
                recentMovements.map((movement, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{movement.date}</TableCell>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Нет операций
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="incoming" className="space-y-6 animate-fade-in">
        <BarcodeScanner stockData={stockData} onScan={handleBarcodeIncoming} />
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ручное поступление товаров</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Товар</Label>
                <Select value={incomingForm.product_id} onValueChange={(val) => setIncomingForm({ ...incomingForm, product_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockData.map((item) => (
                      <SelectItem key={item.id} value={item.id?.toString() || ''}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Количество</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={incomingForm.quantity}
                  onChange={(e) => setIncomingForm({ ...incomingForm, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Поставщик</Label>
                <Input 
                  placeholder="Название поставщика"
                  value={incomingForm.supplier}
                  onChange={(e) => setIncomingForm({ ...incomingForm, supplier: e.target.value })}
                />
              </div>
            </div>
            <Button size="lg" className="w-full gap-2" onClick={handleIncoming}>
              <Icon name="PackagePlus" size={20} />
              Провести поступление
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="outgoing" className="space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Списание товаров</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Товар</Label>
                <Select value={outgoingForm.product_id} onValueChange={(val) => setOutgoingForm({ ...outgoingForm, product_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите товар" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockData.map((item) => (
                      <SelectItem key={item.id} value={item.id?.toString() || ''}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Количество</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={outgoingForm.quantity}
                  onChange={(e) => setOutgoingForm({ ...outgoingForm, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Причина</Label>
                <Select value={outgoingForm.reason} onValueChange={(val) => setOutgoingForm({ ...outgoingForm, reason: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите причину" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Продажа">Продажа</SelectItem>
                    <SelectItem value="Брак">Брак</SelectItem>
                    <SelectItem value="Списание">Списание</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Примечание</Label>
                <Input 
                  placeholder="Дополнительная информация"
                  value={outgoingForm.notes}
                  onChange={(e) => setOutgoingForm({ ...outgoingForm, notes: e.target.value })}
                />
              </div>
            </div>
            <Button size="lg" variant="destructive" className="w-full gap-2" onClick={handleOutgoing}>
              <Icon name="PackageMinus" size={20} />
              Провести списание
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="stock" className="space-y-6 animate-fade-in">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Остатки товаров</h3>
            <Input placeholder="Поиск по названию или инвентарному номеру" className="max-w-xs" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Инвентарный номер</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Партия</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.length > 0 ? (
                stockData.map((item) => (
                  <TableRow key={item.inventory_number}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.inventory_number}</TableCell>
                    <TableCell>{item.quantity} шт</TableCell>
                    <TableCell>{item.batch}</TableCell>
                    <TableCell>{item.price.toLocaleString()} ₽</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.quantity < item.minStock / 2
                            ? "destructive"
                            : item.quantity < item.minStock
                            ? "default"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Нет товаров. Добавьте первый товар через кнопку "Добавить товар"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-6 animate-fade-in">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">История операций</h3>
          <div className="space-y-4">
            {recentMovements.length > 0 ? (
              recentMovements.map((movement, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover-scale">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      movement.type === "Поступление" ? "bg-secondary/10" : "bg-destructive/10"
                    }`}>
                      <Icon 
                        name={movement.type === "Поступление" ? "ArrowDown" : "ArrowUp"} 
                        size={20} 
                        className={movement.type === "Поступление" ? "text-secondary" : "text-destructive"}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{movement.product}</p>
                      <p className="text-sm text-muted-foreground">{movement.user} • {movement.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${movement.quantity > 0 ? "text-secondary" : "text-destructive"}`}>
                      {movement.quantity > 0 ? "+" : ""}{movement.quantity} шт
                    </p>
                    <Badge variant="outline">{movement.type}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Нет операций
              </div>
            )}
          </div>
        </Card>
      </TabsContent>

      {isAdmin && (
        <TabsContent value="users" className="space-y-6 animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Управление пользователями</h3>
              <UserAddDialog />
            </div>
            <UsersTable />
          </Card>
        </TabsContent>
      )}
    </>
  );
}