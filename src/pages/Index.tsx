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
import { useOfflineStorage } from "@/hooks/useOfflineStorage";


const STOCK_API = 'https://functions.poehali.dev/854afd98-2bf3-4236-b8b0-7995df44c841';
const MOVEMENTS_API = 'https://functions.poehali.dev/178c4661-b69a-4921-8960-35d7db62c2d5';
const EXPORT_API = 'https://functions.poehali.dev/48cb185d-5567-489a-8908-5e8bc392080f';
const IMPORT_API = 'https://functions.poehali.dev/1c73e0e3-b0c0-4736-9352-752eb1a20a78';

const Index = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { isOnline, offlineData, saveOfflineData } = useOfflineStorage();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stockData, setStockData] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    inventory_number: '',
    quantity: 0,
    min_stock: 0,
    price: 0,
    batch: ''
  });
  const { toast } = useToast();

  const loadData = async () => {
    if (!isOnline && offlineData) {
      setStockData(offlineData.products || []);
      setRecentMovements(offlineData.movements || []);
      setLoading(false);
      toast({
        title: "Офлайн режим",
        description: "Показаны данные из кэша",
        variant: "default"
      });
      return;
    }

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
        inventory_number: p.inventory_number,
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
      
      saveOfflineData({ products: formattedProducts, movements: formattedMovements });
    } catch (error) {
      console.error('Error loading data:', error);
      if (offlineData) {
        setStockData(offlineData.products || []);
        setRecentMovements(offlineData.movements || []);
        toast({
          title: "Ошибка подключения",
          description: "Показаны данные из кэша",
          variant: "destructive"
        });
      }
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
        setNewProduct({ name: '', inventory_number: '', quantity: 0, min_stock: 0, price: 0, batch: '' });
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

  const handleExportExcel = async () => {
    try {
      const response = await fetch(EXPORT_API);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stock_products.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Excel файл скачан",
          description: "Данные успешно экспортированы"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось экспортировать данные",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка при экспорте данных",
        variant: "destructive"
      });
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      toast({
        title: "Ошибка",
        description: "Выберите файл для импорта",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];
        
        const response = await fetch(IMPORT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64Data })
        });
        
        if (response.ok) {
          const result = await response.json();
          
          setImportOpen(false);
          setSelectedFile(null);
          
          await loadData();
          
          toast({
            title: "Импорт завершен",
            description: `Добавлено: ${result.inserted}, Обновлено: ${result.updated}. База данных обновлена!`
          });
        } else {
          const error = await response.json();
          toast({
            title: "Ошибка импорта",
            description: error.error || "Не удалось импортировать данные",
            variant: "destructive"
          });
        }
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Ошибка",
        description: "Ошибка при импорте данных",
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
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Система управления складом и товарами
              {!isOnline && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium">
                  <Icon name="WifiOff" size={14} />
                  Офлайн
                </span>
              )}
            </p>
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

        <div className="flex items-center justify-end mb-4 gap-3">
          <Button size="lg" className="gap-2" variant="outline" onClick={handleExportExcel}>
            <Icon name="Download" size={20} />
            Скачать Excel
          </Button>
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2" variant="outline" disabled={!isAdmin}>
                <Icon name="Upload" size={20} />
                Импорт Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Импорт из Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Загрузите Excel файл с товарами. Файл должен содержать колонки: Название, Инвентарный номер, Количество, Мин. остаток, Цена, Партия
                </p>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="text-sm">Выбран файл: {selectedFile.name}</p>
                )}
                <Button className="w-full" onClick={handleImportExcel} disabled={!selectedFile}>
                  <Icon name="Upload" size={18} className="mr-2" />
                  Импортировать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                  <Label htmlFor="inventory_number" className="text-right">Инвентарный номер</Label>
                  <Input 
                    id="inventory_number" 
                    className="col-span-3"
                    value={newProduct.inventory_number}
                    onChange={(e) => setNewProduct({ ...newProduct, inventory_number: e.target.value })}
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