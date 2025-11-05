import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { ActItem, ActData } from "./types";

interface ActPreviewProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actData: ActData;
  items: ActItem[];
  totalSum: number;
  onPrint: () => void;
  isProcessing: boolean;
}

export function ActPreview({ 
  isOpen, 
  onOpenChange, 
  actData, 
  items, 
  totalSum, 
  onPrint,
  isProcessing 
}: ActPreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Icon name="Eye" size={16} />
          Предпросмотр
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Предпросмотр акта списания</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="text-center">
            <h2 className="text-xl font-bold">АКТ СПИСАНИЯ ТОВАРНО-МАТЕРИАЛЬНЫХ ЦЕННОСТЕЙ</h2>
            <p className="text-sm text-muted-foreground">
              № {actData.actNumber} от {new Date(actData.date).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Ответственное лицо:</strong> {actData.responsible || '_________________'}</p>
            <p><strong>Комиссия по списанию:</strong></p>
            <ul className="list-disc list-inside ml-4">
              {actData.commissionMembers.filter(m => m.trim()).length > 0 
                ? actData.commissionMembers.filter(m => m.trim()).map((member, idx) => (
                    <li key={idx}>{member}</li>
                  ))
                : <li className="list-none">_________________</li>
              }
            </ul>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2">№</th>
                  <th className="border p-2">Наименование</th>
                  <th className="border p-2">Инвентарный номер</th>
                  <th className="border p-2">Кол-во</th>
                  <th className="border p-2">Цена</th>
                  <th className="border p-2">Сумма</th>
                  <th className="border p-2">Причина</th>
                </tr>
              </thead>
              <tbody>
                {items.filter(item => item.product).map((item, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{idx + 1}</td>
                    <td className="border p-2">{item.product?.name}</td>
                    <td className="border p-2">{item.product?.inventory_number}</td>
                    <td className="border p-2">{item.quantity} шт</td>
                    <td className="border p-2">{item.product?.price.toLocaleString('ru-RU')} ₽</td>
                    <td className="border p-2">{((item.product?.price || 0) * item.quantity).toLocaleString('ru-RU')} ₽</td>
                    <td className="border p-2">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right font-bold">
            Итого: {totalSum.toLocaleString('ru-RU')} ₽
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <Button onClick={() => { onPrint(); onOpenChange(false); }} className="gap-2" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <Icon name="Printer" size={16} />
                Провести и печать
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}