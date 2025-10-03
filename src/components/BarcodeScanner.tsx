import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface StockItem {
  id?: number;
  name: string;
  inventory_number: string;
  quantity: number;
}

interface BarcodeScannerProps {
  stockData: StockItem[];
  onScan: (inventory_number: string, quantity: number) => void;
}

interface ScannedItem {
  product: StockItem;
  quantity: number;
  timestamp: Date;
}

interface BarcodeSearchResult {
  barcode: string;
  name?: string;
  brand?: string;
  category?: string;
  description?: string;
  image?: string;
}

export function BarcodeScanner({ stockData, onScan }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [barcode, setBarcode] = useState('');
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchResult, setSearchResult] = useState<BarcodeSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanBuffer = useRef('');
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Приятный двухтональный звук "бип-бип"
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.08);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const searchBarcodeOnline = async (barcode: string): Promise<BarcodeSearchResult | null> => {
    setIsSearching(true);
    try {
      // Используем Open Food Facts API для поиска товаров
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        return {
          barcode: barcode,
          name: product.product_name || product.product_name_ru || 'Товар не определён',
          brand: product.brands || '',
          category: product.categories || '',
          description: product.generic_name || product.generic_name_ru || '',
          image: product.image_url || product.image_front_url || ''
        };
      }
      
      // Альтернативный поиск через UPCitemdb (если нужен ключ API)
      // const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
      
      return null;
    } catch (error) {
      console.error('Barcode search error:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isScanning) return;

      if (e.key === 'Enter') {
        if (scanBuffer.current.length > 0) {
          handleScan(scanBuffer.current);
          scanBuffer.current = '';
        }
      } else if (e.key.length === 1) {
        scanBuffer.current += e.key;
        
        if (scanTimeout.current) {
          clearTimeout(scanTimeout.current);
        }
        
        scanTimeout.current = setTimeout(() => {
          scanBuffer.current = '';
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, [isScanning, stockData]);

  const handleScan = async (scannedBarcode: string) => {
    const product = stockData.find(item => item.inventory_number === scannedBarcode);
    
    if (!product) {
      // Если товар не найден в базе, ищем в интернете
      toast({
        title: "Поиск товара...",
        description: `Ищу информацию о штрих-коде ${scannedBarcode} в интернете`,
      });
      
      const result = await searchBarcodeOnline(scannedBarcode);
      
      if (result) {
        setSearchResult(result);
        toast({
          title: "Товар найден!",
          description: `${result.name}${result.brand ? ` (${result.brand})` : ''}`,
        });
      } else {
        setSearchResult(null);
        toast({
          title: "Товар не найден",
          description: `Штрих-код ${scannedBarcode} не найден ни в базе, ни в интернете`,
          variant: "destructive"
        });
      }
      return;
    }

    const existingItem = scannedItems.find(item => item.product.inventory_number === scannedBarcode);
    
    if (existingItem) {
      setScannedItems(items =>
        items.map(item =>
          item.product.inventory_number === scannedBarcode
            ? { ...item, quantity: item.quantity + 1, timestamp: new Date() }
            : item
        )
      );
    } else {
      setScannedItems(items => [
        { product, quantity: 1, timestamp: new Date() },
        ...items
      ]);
    }

    playSuccessSound();
    
    toast({
      title: "Товар отсканирован",
      description: `${product.name} добавлен (+1)`,
    });

    setBarcode('');
    inputRef.current?.focus();
  };

  const handleManualScan = () => {
    if (barcode.trim()) {
      handleScan(barcode.trim());
    }
  };

  const updateQuantity = (inventory_number: string, quantity: number) => {
    if (quantity <= 0) {
      setScannedItems(items => items.filter(item => item.product.inventory_number !== inventory_number));
    } else {
      setScannedItems(items =>
        items.map(item =>
          item.product.inventory_number === inventory_number
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeItem = (inventory_number: string) => {
    setScannedItems(items => items.filter(item => item.product.inventory_number !== inventory_number));
  };

  const handleSubmitAll = () => {
    scannedItems.forEach(item => {
      onScan(item.product.inventory_number, item.quantity);
    });
    setScannedItems([]);
    toast({
      title: "Поступление проведено",
      description: `Обработано ${scannedItems.length} позиций`
    });
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      inputRef.current?.focus();
    }
  };

  const totalItems = scannedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isScanning ? 'bg-secondary/10 animate-pulse' : 'bg-muted'
            }`}>
              <Icon 
                name={isScanning ? "ScanLine" : "Barcode"} 
                size={24} 
                className={isScanning ? 'text-secondary' : 'text-muted-foreground'}
              />
            </div>
            <div>
              <h4 className="font-semibold">Сканирование штрих-кодов</h4>
              <p className="text-sm text-muted-foreground">
                {isScanning ? 'Режим сканирования активен' : 'Нажмите "Начать сканирование"'}
              </p>
            </div>
          </div>
          <Button 
            variant={isScanning ? "destructive" : "default"}
            onClick={toggleScanning}
            className="gap-2"
          >
            <Icon name={isScanning ? "Square" : "Play"} size={16} />
            {isScanning ? 'Остановить' : 'Начать сканирование'}
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Label>Штрих-код (или используйте сканер)</Label>
            <Input
              ref={inputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
              placeholder="Отсканируйте или введите штрих-код"
              disabled={!isScanning}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleManualScan} disabled={!isScanning || !barcode.trim()}>
              <Icon name="Search" size={16} />
            </Button>
          </div>
        </div>

        {isSearching && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="animate-spin">
              <Icon name="Loader2" className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400">Поиск товара в интернете...</span>
          </div>
        )}

        {searchResult && (
          <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex gap-4">
              {searchResult.image && (
                <img 
                  src={searchResult.image} 
                  alt={searchResult.name} 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">{searchResult.name}</h4>
                    {searchResult.brand && (
                      <p className="text-sm text-blue-700 dark:text-blue-300">Бренд: {searchResult.brand}</p>
                    )}
                    {searchResult.category && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">Категория: {searchResult.category}</p>
                    )}
                    {searchResult.description && (
                      <p className="text-sm text-muted-foreground mt-1">{searchResult.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Штрих-код: {searchResult.barcode}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSearchResult(null)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
                <div className="mt-3 text-sm text-blue-700 dark:text-blue-300">
                  💡 Товар найден в Open Food Facts. Добавьте его в базу данных для дальнейшего использования.
                </div>
              </div>
            </div>
          </div>
        )}

        {scannedItems.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="Package" className="text-secondary" size={20} />
              <span className="font-medium">Отсканировано: {totalItems} шт из {scannedItems.length} позиций</span>
            </div>
            <Button onClick={handleSubmitAll} className="gap-2">
              <Icon name="Check" size={16} />
              Провести поступление
            </Button>
          </div>
        )}
      </Card>

      {scannedItems.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Отсканированные товары</h4>
          <div className="space-y-2">
            {scannedItems.map((item) => (
              <div 
                key={item.product.inventory_number} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon name="Package" className="text-secondary" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{item.product.inventory_number}</Badge>
                      <span>•</span>
                      <span>{item.timestamp.toLocaleTimeString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.inventory_number, item.quantity - 1)}
                  >
                    <Icon name="Minus" size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product.inventory_number, parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.inventory_number, item.quantity + 1)}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.product.inventory_number)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}