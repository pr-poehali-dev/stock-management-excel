import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { ActItem, ActData, StockItem } from "./types";

interface ActFormProps {
  actData: ActData;
  onActDataChange: (data: ActData) => void;
  items: ActItem[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof ActItem, value: any) => void;
  stockData: StockItem[];
  totalSum: number;
  onClear: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export function ActForm({
  actData,
  onActDataChange,
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  stockData,
  totalSum,
  onClear,
  onSubmit,
  isProcessing
}: ActFormProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div>
          <Label>Номер акта</Label>
          <Input 
            value={actData.actNumber}
            onChange={(e) => onActDataChange({ ...actData, actNumber: e.target.value })}
          />
        </div>
        <div>
          <Label>Дата</Label>
          <Input 
            type="date"
            value={actData.date}
            onChange={(e) => onActDataChange({ ...actData, date: e.target.value })}
          />
        </div>
        <div>
          <Label>Ответственное лицо</Label>
          <Input 
            placeholder="ФИО ответственного"
            value={actData.responsible}
            onChange={(e) => onActDataChange({ ...actData, responsible: e.target.value })}
          />
        </div>
        <div>
          <Label>Комиссия</Label>
          <Input 
            placeholder="Члены комиссии"
            value={actData.commission}
            onChange={(e) => onActDataChange({ ...actData, commission: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Товары для списания</h4>
          <Button variant="outline" size="sm" onClick={onAddItem} className="gap-2">
            <Icon name="Plus" size={16} />
            Добавить товар
          </Button>
        </div>

        {items.map((item, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 grid gap-4 md:grid-cols-4">
                <div>
                  <Label>Товар</Label>
                  <Select 
                    value={item.product?.id?.toString() || ''} 
                    onValueChange={(val) => onUpdateItem(idx, 'product', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите товар" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockData.map((product) => (
                        <SelectItem key={product.id} value={product.id?.toString() || ''}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Количество</Label>
                  <Input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    max={item.product?.quantity || 0}
                  />
                  {item.product && (
                    <p className="text-xs text-muted-foreground mt-1">
                      На складе: {item.product.quantity} шт
                    </p>
                  )}
                </div>
                <div>
                  <Label>Цена за ед.</Label>
                  <Input 
                    value={item.product?.price.toLocaleString('ru-RU') + ' ₽' || '—'}
                    disabled
                  />
                </div>
                <div>
                  <Label>Сумма</Label>
                  <Input 
                    value={((item.product?.price || 0) * item.quantity).toLocaleString('ru-RU') + ' ₽'}
                    disabled
                  />
                </div>
                <div className="md:col-span-4">
                  <Label>Причина списания</Label>
                  <Textarea 
                    value={item.reason}
                    onChange={(e) => onUpdateItem(idx, 'reason', e.target.value)}
                    placeholder="Укажите причину списания"
                  />
                </div>
              </div>
              {items.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemoveItem(idx)}
                  className="text-destructive hover:text-destructive"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              )}
            </div>
          </Card>
        ))}

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="font-semibold">Общая сумма списания:</span>
          <span className="text-2xl font-bold">{totalSum.toLocaleString('ru-RU')} ₽</span>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClear}>
            Очистить
          </Button>
          <Button onClick={onSubmit} className="gap-2" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <Icon name="Printer" size={16} />
                Провести списание и печать
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
