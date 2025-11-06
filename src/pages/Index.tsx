import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/components/LoginPage";
import { StockHeader } from "@/components/StockHeader";
import { StatsCards } from "@/components/StatsCards";
import { StockTabs } from "@/components/StockTabs";
import { Reports } from "@/components/Reports";
import { WriteOffAct } from "@/components/WriteOffAct";
import { StockAlerts } from "@/components/NotificationCenter";
import { StockToolbar } from "@/components/Toolbar/StockToolbar";
import { useToast } from "@/hooks/use-toast";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

const STOCK_API = 'https://functions.poehali.dev/854afd98-2bf3-4236-b8b0-7995df44c841';
const MOVEMENTS_API = 'https://functions.poehali.dev/178c4661-b69a-4921-8960-35d7db62c2d5';
const EXPORT_API = 'https://functions.poehali.dev/48cb185d-5567-489a-8908-5e8bc392080f';
const IMPORT_API = 'https://functions.poehali.dev/1c73e0e3-b0c0-4736-9352-752eb1a20a78';
const CLEAR_DB_API = 'https://functions.poehali.dev/bab0feeb-2c4b-43b9-ba7b-e35e1cf7d977';

const Index = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { isOnline, offlineData, saveOfflineData } = useOfflineStorage();
  const [activeTab, setActiveTab] = useState("stock");
  const [stockData, setStockData] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    inventory_number: '',
    quantity: 0,
    min_stock: 0,
    price: 0,
    batch: '',
    unit: 'шт'
  });
  const { toast } = useToast();

  const loadData = async () => {
    if (!isOnline && offlineData) {
      setStockData(offlineData.products || []);
      setRecentMovements(offlineData.movements || []);
      setLoading(false);
      setInitialLoad(false);
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
        unit: p.unit || 'шт',
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
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setInitialLoad(false);
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
        setNewProduct({ name: '', inventory_number: '', quantity: 0, min_stock: 0, price: 0, batch: '', unit: 'шт' });
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
          
          toast({
            title: "Импорт завершен",
            description: `Добавлено: ${result.inserted}, Обновлено: ${result.updated}`
          });
          
          setImportOpen(false);
          setSelectedFile(null);
          setLoading(false);
          
          await loadData();
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

  const handleClearDatabase = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить все товары и движения из базы данных? Это действие нельзя отменить!')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(CLEAR_DB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: "База данных очищена",
          description: `Удалено товаров: ${result.products_deleted}, движений: ${result.movements_deleted}`
        });
        
        await loadData();
      } else {
        const error = await response.json();
        toast({
          title: "Ошибка очистки",
          description: error.error || "Не удалось очистить базу данных",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка при очистке базы данных",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (initialLoad) {
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

  const filteredStockData = useMemo(() => {
    if (!searchQuery.trim()) return stockData;
    
    const query = searchQuery.toLowerCase().trim();
    return stockData.filter((item: any) => 
      item.name?.toLowerCase().includes(query) ||
      item.inventory_number?.toLowerCase().includes(query) ||
      item.batch?.toLowerCase().includes(query)
    );
  }, [stockData, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <StockHeader 
        isOnline={isOnline}
        isAdmin={isAdmin}
        userName={user?.name}
        onLogout={logout}
        stockData={stockData}
        loading={loading}
      />

      <div className="border-b bg-[#f3f3f3] px-4 py-2 flex items-center justify-between">
        <StockToolbar
          isAdmin={isAdmin}
          onExport={handleExportExcel}
          onClearDatabase={handleClearDatabase}
          importOpen={importOpen}
          onImportOpenChange={setImportOpen}
          selectedFile={selectedFile}
          onFileChange={setSelectedFile}
          onImport={handleImportExcel}
          newProductOpen={newProductOpen}
          onNewProductOpenChange={setNewProductOpen}
          newProduct={newProduct}
          onProductChange={setNewProduct}
          onAddProduct={handleAddProduct}
        />
        <div className="flex items-center gap-2">
          <StatsCards stockData={stockData} />
        </div>
      </div>

      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-[#f3f3f3] border-b rounded-none h-auto p-0">
            <TabsTrigger value="stock" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#217346] data-[state=active]:bg-white px-4 py-2">
              <Icon name="Database" size={16} />
              Остатки
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#217346] data-[state=active]:bg-white px-4 py-2">
              <Icon name="PackagePlus" size={16} />
              Поступление
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#217346] data-[state=active]:bg-white px-4 py-2">
              <Icon name="PackageMinus" size={16} />
              Списание
            </TabsTrigger>
            <TabsTrigger value="writeoff" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#217346] data-[state=active]:bg-white px-4 py-2">
              <Icon name="FileText" size={16} />
              Акт списания
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#217346] data-[state=active]:bg-white px-4 py-2">
              <Icon name="BarChart3" size={16} />
              Отчёты
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <StockAlerts stockData={stockData} />
            
            {activeTab === "stock" && (
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Поиск по названию, артикулу или партии..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            <StockTabs
              stockData={activeTab === "stock" ? filteredStockData : stockData}
              recentMovements={recentMovements}
              chartData={chartData}
              categoryData={categoryData}
              isAdmin={isAdmin}
              onDataUpdate={loadData}
            />

            <div className={activeTab === "writeoff" ? "" : "hidden"}>
              <WriteOffAct stockData={stockData} onDataUpdate={loadData} />
            </div>

            <div className={activeTab === "reports" ? "" : "hidden"}>
              <Reports chartData={chartData} categoryData={categoryData} />
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;