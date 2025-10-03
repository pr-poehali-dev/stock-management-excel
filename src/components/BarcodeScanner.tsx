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
  sku: string;
  quantity: number;
}

interface BarcodeScannerProps {
  stockData: StockItem[];
  onScan: (sku: string, quantity: number) => void;
}

interface ScannedItem {
  product: StockItem;
  quantity: number;
  timestamp: Date;
}

export function BarcodeScanner({ stockData, onScan }: BarcodeScannerProps) {
  const { toast } = useToast();
  const [barcode, setBarcode] = useState('');
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scanBuffer = useRef('');
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const handleScan = (scannedBarcode: string) => {
    const product = stockData.find(item => item.sku === scannedBarcode);
    
    if (!product) {
      toast({
        title: "Товар не найден",
        description: `Штрих-код ${scannedBarcode} не найден в базе`,
        variant: "destructive"
      });
      return;
    }

    const existingItem = scannedItems.find(item => item.product.sku === scannedBarcode);
    
    if (existingItem) {
      setScannedItems(items =>
        items.map(item =>
          item.product.sku === scannedBarcode
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

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      setScannedItems(items => items.filter(item => item.product.sku !== sku));
    } else {
      setScannedItems(items =>
        items.map(item =>
          item.product.sku === sku
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeItem = (sku: string) => {
    setScannedItems(items => items.filter(item => item.product.sku !== sku));
  };

  const handleSubmitAll = () => {
    scannedItems.forEach(item => {
      onScan(item.product.sku, item.quantity);
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
                key={item.product.sku} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon name="Package" className="text-secondary" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{item.product.sku}</Badge>
                      <span>•</span>
                      <span>{item.timestamp.toLocaleTimeString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.sku, item.quantity - 1)}
                  >
                    <Icon name="Minus" size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product.sku, parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.sku, item.quantity + 1)}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.product.sku)}
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
