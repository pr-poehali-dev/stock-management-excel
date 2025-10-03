import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/LoginPage";

const Index = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const stockData = [
    { name: "Ноутбук Dell XPS 15", sku: "LT-001", quantity: 45, minStock: 20, price: 89900, batch: "2024-09", status: "В наличии" },
    { name: "Клавиатура Logitech MX", sku: "KB-002", quantity: 8, minStock: 15, price: 12500, batch: "2024-08", status: "Мало" },
    { name: "Монитор Samsung 27\"", sku: "MN-003", quantity: 23, minStock: 10, price: 24900, batch: "2024-10", status: "В наличии" },
    { name: "Мышь Razer DeathAdder", sku: "MS-004", quantity: 67, minStock: 30, price: 4500, batch: "2024-09", status: "В наличии" },
    { name: "Наушники Sony WH-1000XM5", sku: "HP-005", quantity: 3, minStock: 12, price: 32900, batch: "2024-07", status: "Критично" },
  ];

  const recentMovements = [
    { date: "2024-10-03", product: "Ноутбук Dell XPS 15", type: "Поступление", quantity: 20, user: "Иванов И.И." },
    { date: "2024-10-02", product: "Мышь Razer DeathAdder", type: "Списание", quantity: -5, user: "Петрова А.С." },
    { date: "2024-10-02", product: "Монитор Samsung 27\"", type: "Поступление", quantity: 15, user: "Сидоров П.К." },
    { date: "2024-10-01", product: "Наушники Sony WH-1000XM5", type: "Списание", quantity: -8, user: "Иванов И.И." },
  ];

  const chartData = [
    { month: "Май", incoming: 320, outgoing: 180 },
    { month: "Июн", incoming: 280, outgoing: 240 },
    { month: "Июл", incoming: 450, outgoing: 290 },
    { month: "Авг", incoming: 380, outgoing: 320 },
    { month: "Сен", incoming: 520, outgoing: 410 },
    { month: "Окт", incoming: 390, outgoing: 280 },
  ];

  const categoryData = [
    { name: "Ноутбуки", value: 45, color: "#2563EB" },
    { name: "Периферия", value: 98, color: "#10B981" },
    { name: "Мониторы", value: 23, color: "#F59E0B" },
  ];

  const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const lowStockItems = stockData.filter(item => item.quantity < item.minStock).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Складской учёт</h1>
            <p className="text-muted-foreground mt-2">Система управления складом и товарами</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
              <Icon name={isAdmin ? "Shield" : "User"} size={20} className={isAdmin ? "text-primary" : "text-blue-600"} />
              <div>
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{isAdmin ? "Администратор" : "Пользователь"}</div>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="gap-2">
              <Icon name="LogOut" size={18} />
              Выход
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2" disabled={!isAdmin}>
                <Icon name="Plus" size={20} />
                Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Новый товар</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Название</Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">Артикул</Label>
                  <Input id="sku" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="barcode" className="text-right">Штрихкод</Label>
                  <Input id="barcode" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Цена</Label>
                  <Input id="price" type="number" className="col-span-3" />
                </div>
                <Button className="mt-4">Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="gap-2">
              <Icon name="LayoutDashboard" size={16} />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2" disabled={!isAdmin}>
              <Icon name="PackagePlus" size={16} />
              Поступление
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2" disabled={!isAdmin}>
              <Icon name="PackageMinus" size={16} />
              Списание
            </TabsTrigger>
            <TabsTrigger value="stock" className="gap-2">
              <Icon name="Database" size={16} />
              Остатки
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Icon name="History" size={16} />
              История
            </TabsTrigger>
          </TabsList>

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
                  {recentMovements.map((movement, idx) => (
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
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="incoming" className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Поступление товаров</h3>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Товар</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите товар" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockData.map((item) => (
                          <SelectItem key={item.sku} value={item.sku}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Количество</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Партия</Label>
                    <Input placeholder="2024-10" />
                  </div>
                  <div>
                    <Label>Поставщик</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите поставщика" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier1">ООО "Технопоставка"</SelectItem>
                        <SelectItem value="supplier2">ИП Иванов</SelectItem>
                        <SelectItem value="supplier3">ООО "МегаТех"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button size="lg" className="w-full gap-2">
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
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите товар" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockData.map((item) => (
                          <SelectItem key={item.sku} value={item.sku}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Количество</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Причина</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите причину" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Продажа</SelectItem>
                        <SelectItem value="defect">Брак</SelectItem>
                        <SelectItem value="write-off">Списание</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Примечание</Label>
                    <Input placeholder="Дополнительная информация" />
                  </div>
                </div>
                <Button size="lg" variant="destructive" className="w-full gap-2">
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
                <Input placeholder="Поиск по названию или артикулу" className="max-w-xs" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Партия</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">История операций</h3>
              <div className="space-y-4">
                {recentMovements.map((movement, idx) => (
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
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;