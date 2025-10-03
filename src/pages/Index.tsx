import { useState, useEffect } from "react";
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
import { Reports } from "@/components/Reports";
import { WriteOffAct } from "@/components/WriteOffAct";
import { NotificationCenter, StockAlerts } from "@/components/NotificationCenter";
import { useToast } from "@/hooks/use-toast";

const STOCK_API = 'https://functions.poehali.dev/854afd98-2bf3-4236-b8b0-7995df44c841';
const MOVEMENTS_API = 'https://functions.poehali.dev/178c4661-b69a-4921-8960-35d7db62c2d5';

const Index = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stockData, setStockData] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    quantity: 0,
    min_stock: 0,
    price: 0,
    batch: ''
  });
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [productsRes, movementsRes] = await Promise.all([
        fetch(STOCK_API),
        fetch(MOVEMENTS_API)
      ]);
      
      const productsData = await productsRes.json();
      const movementsData = await movementsRes.json();
      
      const formattedProducts = productsData.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        minStock: p.min_stock,
        price: p.price,
        batch: p.batch || '',
        status: p.quantity < p.min_stock / 2 ? 'Критично' : p.quantity < p.min_stock ? 'Мало' : 'В наличии'
      }));
      
      const formattedMovements = movementsData.movements.map((m: any) => ({
        date: new Date(m.created_at).toLocaleDateString('ru-RU'),
        product: m.product_name,
        type: m.movement_type,
        quantity: m.movement_type === 'Поступление' ? m.quantity : -m.quantity,
        user: m.user_name
      }));
      
      setStockData(formattedProducts);
      setRecentMovements(formattedMovements);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleAddProduct = async () => {
    try {
      const response = await fetch(STOCK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      
      if (response.ok) {
        toast({
          title: "Товар добавлен",
          description: `${newProduct.name} успешно добавлен в систему`
        });
        setNewProductOpen(false);
        setNewProduct({ name: '', sku: '', quantity: 0, min_stock: 0, price: 0, batch: '' });
        loadData();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить товар",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка при добавлении товара",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

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
            <NotificationCenter stockData={stockData} />
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
          <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
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
                  <Input 
                    id="name" 
                    className="col-span-3" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">Артикул</Label>
                  <Input 
                    id="sku" 
                    className="col-span-3"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Количество</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    className="col-span-3"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="min_stock" className="text-right">Мин. остаток</Label>
                  <Input 
                    id="min_stock" 
                    type="number" 
                    className="col-span-3"
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, min_stock: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Цена</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    className="col-span-3"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="batch" className="text-right">Партия</Label>
                  <Input 
                    id="batch" 
                    className="col-span-3"
                    value={newProduct.batch}
                    onChange={(e) => setNewProduct({ ...newProduct, batch: e.target.value })}
                  />
                </div>
                <Button className="mt-4" onClick={handleAddProduct}>Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <StatsCards stockData={stockData} />

        <StockAlerts stockData={stockData} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
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
            <TabsTrigger value="reports" className="gap-2">
              <Icon name="BarChart3" size={16} />
              Отчёты
            </TabsTrigger>
            <TabsTrigger value="writeoff" className="gap-2" disabled={!isAdmin}>
              <Icon name="FileText" size={16} />
              Акты
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
            onDataUpdate={loadData}
          />
          
          {activeTab === "reports" && <Reports stockData={stockData} />}
          {activeTab === "writeoff" && isAdmin && <WriteOffAct stockData={stockData} onDataUpdate={loadData} />}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;