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
  unit?: string;
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

      <TabsContent value="stock" className="animate-fade-in">
        <div className="overflow-x-auto border">
          <Table className="bg-white">
            <TableHeader className="bg-[#217346] text-white">
              <TableRow className="border-b border-gray-400 hover:bg-[#217346]">
                <TableHead className="text-white font-semibold border-r border-gray-400">Название</TableHead>
                <TableHead className="text-white font-semibold border-r border-gray-400">Инвентарный номер</TableHead>
                <TableHead className="text-white font-semibold border-r border-gray-400 text-right">Количество</TableHead>
                <TableHead className="text-white font-semibold border-r border-gray-400">Ед. изм.</TableHead>
                <TableHead className="text-white font-semibold border-r border-gray-400">Партия</TableHead>
                <TableHead className="text-white font-semibold border-r border-gray-400 text-right">Цена</TableHead>
                <TableHead className="text-white font-semibold">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.length > 0 ? (
                stockData.map((item, idx) => (
                  <TableRow key={item.inventory_number} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <TableCell className="border-r border-gray-300 font-medium">{item.name}</TableCell>
                    <TableCell className="border-r border-gray-300">{item.inventory_number}</TableCell>
                    <TableCell className="border-r border-gray-300 text-right">{item.quantity}</TableCell>
                    <TableCell className="border-r border-gray-300">{item.unit || 'шт'}</TableCell>
                    <TableCell className="border-r border-gray-300">{item.batch}</TableCell>
                    <TableCell className="border-r border-gray-300 text-right">{item.price.toLocaleString()} ₽</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs ${
                        item.quantity < item.minStock / 2
                          ? "bg-red-100 text-red-800"
                          : item.quantity < item.minStock
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Нет товаров. Добавьте первый товар через кнопку "Добавить"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="history" className="animate-fade-in">
        <div className="overflow-x-auto border">
          <Table className="bg-white">
            <TableHeader className="bg-[#217346] text-white">
              <TableRow className="border-b border-gray-400 hover:bg-[#217346]">
                <TableHead className="text-white font-semibold border-r border-gray-400">Дата</TableHead>
                <TableHead className="text-white font-semibold border-r border-gray-400">Товар</TableHead>
                <TableHead className="text-white font-semibold border-r border-gray-400">Тип операции</TableHead>
                <TableHead className="text-white font-semibold border-r border-gray-400 text-right">Количество</TableHead>
                <TableHead className="text-white font-semibold">Пользователь</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMovements.length > 0 ? (
                recentMovements.map((movement, idx) => (
                  <TableRow key={idx} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <TableCell className="border-r border-gray-300">{movement.date}</TableCell>
                    <TableCell className="border-r border-gray-300 font-medium">{movement.product}</TableCell>
                    <TableCell className="border-r border-gray-300">
                      <span className={`px-2 py-1 text-xs ${
                        movement.type === "Поступление" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {movement.type}
                      </span>
                    </TableCell>
                    <TableCell className={`border-r border-gray-300 text-right font-medium ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                    </TableCell>
                    <TableCell>{movement.user}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Нет операций
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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