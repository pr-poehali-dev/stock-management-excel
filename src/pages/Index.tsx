import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/LoginPage";
import { StatsCards } from "@/components/StatsCards";
import { StockTabs } from "@/components/StockTabs";

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

        <StatsCards stockData={stockData} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
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
            {isAdmin && (
              <TabsTrigger value="users" className="gap-2">
                <Icon name="Users" size={16} />
                Пользователи
              </TabsTrigger>
            )}
          </TabsList>

          <StockTabs 
            stockData={stockData} 
            recentMovements={recentMovements} 
            chartData={chartData} 
            categoryData={categoryData}
            isAdmin={isAdmin}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
