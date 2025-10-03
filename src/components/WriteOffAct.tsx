import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface StockItem {
  id?: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface WriteOffActProps {
  stockData: StockItem[];
}

interface ActItem {
  product: StockItem | null;
  quantity: number;
  reason: string;
}

export function WriteOffAct({ stockData }: WriteOffActProps) {
  const { toast } = useToast();
  const [actData, setActData] = useState({
    actNumber: `АКТ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    date: new Date().toISOString().split('T')[0],
    responsible: '',
    commission: ''
  });
  const [items, setItems] = useState<ActItem[]>([
    { product: null, quantity: 0, reason: '' }
  ]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const printAct = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const actHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Акт списания ${actData.actNumber}</title>
        <style>
          @media print {
            @page { margin: 2cm; }
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            max-width: 21cm;
            margin: 0 auto;
            padding: 1cm;
          }
          .header {
            text-align: center;
            margin-bottom: 2cm;
          }
          .header h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 0.5cm 0;
          }
          .info {
            margin-bottom: 1cm;
          }
          .info p {
            margin: 0.3cm 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1cm 0;
          }
          th, td {
            border: 1px solid black;
            padding: 0.3cm;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .total {
            text-align: right;
            font-weight: bold;
            margin-top: 0.5cm;
          }
          .signatures {
            margin-top: 2cm;
          }
          .signature-line {
            margin: 1cm 0;
            display: flex;
            justify-content: space-between;
          }
          .signature-line span {
            border-bottom: 1px solid black;
            padding: 0 2cm;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>АКТ СПИСАНИЯ ТОВАРНО-МАТЕРИАЛЬНЫХ ЦЕННОСТЕЙ</h1>
          <p>№ ${actData.actNumber} от ${new Date(actData.date).toLocaleDateString('ru-RU')}</p>
        </div>

        <div class="info">
          <p><strong>Ответственное лицо:</strong> ${actData.responsible || '_________________'}</p>
          <p><strong>Комиссия:</strong> ${actData.commission || '_________________'}</p>
        </div>

        <p>Настоящий акт составлен о том, что комиссия произвела списание следующих товарно-материальных ценностей:</p>

        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Наименование</th>
              <th>Артикул</th>
              <th>Количество</th>
              <th>Цена, ₽</th>
              <th>Сумма, ₽</th>
              <th>Причина списания</th>
            </tr>
          </thead>
          <tbody>
            ${items.filter(item => item.product).map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.product?.name}</td>
                <td>${item.product?.sku}</td>
                <td>${item.quantity} шт</td>
                <td>${item.product?.price.toLocaleString('ru-RU')}</td>
                <td>${((item.product?.price || 0) * item.quantity).toLocaleString('ru-RU')}</td>
                <td>${item.reason}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <p>Итого списано на сумму: ${getTotalSum().toLocaleString('ru-RU')} ₽</p>
        </div>

        <div class="signatures">
          <div class="signature-line">
            <span>Председатель комиссии</span>
            <span>________________</span>
          </div>
          <div class="signature-line">
            <span>Члены комиссии</span>
            <span>________________</span>
          </div>
          <div class="signature-line">
            <span></span>
            <span>________________</span>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(actHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };

    toast({
      title: "Акт подготовлен",
      description: "Документ готов к печати"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Создание акта списания</h3>
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
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
                  <p><strong>Комиссия:</strong> {actData.commission || '_________________'}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2">№</th>
                        <th className="border p-2">Наименование</th>
                        <th className="border p-2">Артикул</th>
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
                          <td className="border p-2">{item.product?.sku}</td>
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
                  Итого: {getTotalSum().toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Закрыть
                </Button>
                <Button onClick={() => { printAct(); setIsPreviewOpen(false); }} className="gap-2">
                  <Icon name="Printer" size={16} />
                  Печать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div>
            <Label>Номер акта</Label>
            <Input 
              value={actData.actNumber}
              onChange={(e) => setActData({ ...actData, actNumber: e.target.value })}
            />
          </div>
          <div>
            <Label>Дата</Label>
            <Input 
              type="date"
              value={actData.date}
              onChange={(e) => setActData({ ...actData, date: e.target.value })}
            />
          </div>
          <div>
            <Label>Ответственное лицо</Label>
            <Input 
              placeholder="ФИО ответственного"
              value={actData.responsible}
              onChange={(e) => setActData({ ...actData, responsible: e.target.value })}
            />
          </div>
          <div>
            <Label>Комиссия</Label>
            <Input 
              placeholder="Члены комиссии"
              value={actData.commission}
              onChange={(e) => setActData({ ...actData, commission: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Товары для списания</h4>
            <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
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
                      onValueChange={(val) => updateItem(idx, 'product', val)}
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
                      onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
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
                      onChange={(e) => updateItem(idx, 'reason', e.target.value)}
                      placeholder="Укажите причину списания"
                    />
                  </div>
                </div>
                {items.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(idx)}
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
            <span className="text-2xl font-bold">{getTotalSum().toLocaleString('ru-RU')} ₽</span>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => {
              setActData({
                actNumber: `АКТ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                date: new Date().toISOString().split('T')[0],
                responsible: '',
                commission: ''
              });
              setItems([{ product: null, quantity: 0, reason: '' }]);
            }}>
              Очистить
            </Button>
            <Button onClick={printAct} className="gap-2">
              <Icon name="Printer" size={16} />
              Сформировать и печать
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
