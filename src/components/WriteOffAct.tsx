import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ActPreview } from "./WriteOffAct/ActPreview";
import { ActForm } from "./WriteOffAct/ActForm";
import { generateActHTML, printActDocument } from "./WriteOffAct/printUtils";
import { StockItem, ActItem, ActData } from "./WriteOffAct/types";

const MOVEMENTS_API = 'https://functions.poehali.dev/178c4661-b69a-4921-8960-35d7db62c2d5';

interface WriteOffActProps {
  stockData: StockItem[];
  onDataUpdate?: () => void;
}

export function WriteOffAct({ stockData, onDataUpdate }: WriteOffActProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [actData, setActData] = useState<ActData>({
    actNumber: `АКТ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    responsible: '',
    commission: ''
  });
  const [items, setItems] = useState<ActItem[]>([
    { product: null, quantity: 0, reason: '' }
  ]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addItem = () => {
    setItems([...items, { product: null, quantity: 0, reason: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ActItem, value: any) => {
    const newItems = [...items];
    if (field === 'product') {
      const product = stockData.find(p => p.id?.toString() === value);
      newItems[index].product = product || null;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const getTotalSum = () => {
    return items.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);
  };

  const processWriteOff = async () => {
    const validItems = items.filter(item => item.product && item.quantity > 0);
    
    if (validItems.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы один товар для списания",
        variant: "destructive"
      });
      return false;
    }

    for (const item of validItems) {
      if (item.product && item.quantity > item.product.quantity) {
        toast({
          title: "Ошибка",
          description: `${item.product.name}: недостаточно товара на складе (есть ${item.product.quantity}, требуется ${item.quantity})`,
          variant: "destructive"
        });
        return false;
      }
    }

    setIsProcessing(true);

    try {
      for (const item of validItems) {
        const response = await fetch(MOVEMENTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: item.product?.id,
            movement_type: 'Списание',
            quantity: item.quantity,
            user_name: user?.name || 'Администратор',
            reason: item.reason,
            notes: `Акт списания ${actData.actNumber}`
          })
        });

        if (!response.ok) {
          throw new Error(`Ошибка при списании ${item.product?.name}`);
        }
      }

      toast({
        title: "Успешно",
        description: `Акт ${actData.actNumber} проведён, товары списаны со склада`
      });

      onDataUpdate?.();
      
      return true;
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось провести списание",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const printAct = async () => {
    const success = await processWriteOff();
    if (!success) return;

    const actHTML = generateActHTML(actData, items, getTotalSum());
    printActDocument(actHTML);

    setActData({
      actNumber: `АКТ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      responsible: '',
      commission: ''
    });
    setItems([{ product: null, quantity: 0, reason: '' }]);
  };

  const handleClear = () => {
    setActData({
      actNumber: `АКТ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      responsible: '',
      commission: ''
    });
    setItems([{ product: null, quantity: 0, reason: '' }]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Создание акта списания</h3>
          <ActPreview
            isOpen={isPreviewOpen}
            onOpenChange={setIsPreviewOpen}
            actData={actData}
            items={items}
            totalSum={getTotalSum()}
            onPrint={printAct}
            isProcessing={isProcessing}
          />
        </div>

        <ActForm
          actData={actData}
          onActDataChange={setActData}
          items={items}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onUpdateItem={updateItem}
          stockData={stockData}
          totalSum={getTotalSum()}
          onClear={handleClear}
          onSubmit={printAct}
          isProcessing={isProcessing}
        />
      </Card>
    </div>
  );
}
