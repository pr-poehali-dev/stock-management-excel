import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatQuantity } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";

const WRITEOFF_ACTS_API = 'https://functions.poehali.dev/9cfbeb44-bbad-4db8-86a7-72ee7edc0283';

interface SavedAct {
  id: number;
  act_number: string;
  act_date: string;
  responsible_person: string;
  reason: string;
  items: Array<{
    product_id: number;
    product_name: string;
    inventory_number: string;
    quantity: number;
    price: number;
    reason: string;
  }>;
  created_at: string;
  created_by: string;
  is_draft: boolean;
}

interface SavedActsProps {
  onEditDraft?: (act: SavedAct) => void;
}

export function SavedActs({ onEditDraft }: SavedActsProps) {
  const { toast } = useToast();
  const [acts, setActs] = useState<SavedAct[]>([]);
  const [selectedAct, setSelectedAct] = useState<SavedAct | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActs();
  }, []);

  const loadActs = async () => {
    try {
      setLoading(true);
      const response = await fetch(WRITEOFF_ACTS_API);
      if (response.ok) {
        const data = await response.json();
        setActs(data.acts || []);
      }
    } catch (error) {
      console.error('Error loading acts:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewActDetails = (act: SavedAct) => {
    setSelectedAct(act);
    setIsDetailOpen(true);
  };

  const handleDeleteAct = async (actId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот акт?')) {
      return;
    }

    try {
      const response = await fetch(`${WRITEOFF_ACTS_API}?id=${actId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Акт удалён"
        });
        loadActs();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить акт",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting act:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить акт",
        variant: "destructive"
      });
    }
  };

  const getTotalSum = (items: SavedAct['items']) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const getTotalQuantity = (items: SavedAct['items']) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader2" className="animate-spin" size={32} />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Сохранённые акты списания</h3>
          <Button variant="outline" onClick={loadActs} className="gap-2">
            <Icon name="RefreshCw" size={16} />
            Обновить
          </Button>
        </div>

        {acts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Нет сохранённых актов списания</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер акта</TableHead>
                <TableHead>Дата акта</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Ответственный</TableHead>
                <TableHead>Товаров</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acts.map((act) => (
                <TableRow key={act.id}>
                  <TableCell className="font-medium">{act.act_number}</TableCell>
                  <TableCell>{new Date(act.act_date).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    {act.is_draft ? (
                      <Badge variant="secondary" className="gap-1">
                        <Icon name="FileEdit" size={12} />
                        Черновик
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <Icon name="CheckCircle" size={12} />
                        Проведён
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{act.responsible_person}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {act.items.length} поз. ({formatQuantity(getTotalQuantity(act.items))} шт)
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{getTotalSum(act.items).toFixed(2)} ₽</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(act.created_at).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {act.is_draft && onEditDraft && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onEditDraft(act)}
                          className="gap-2"
                        >
                          <Icon name="Edit" size={16} />
                          Редактировать
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewActDetails(act)}
                        className="gap-2"
                      >
                        <Icon name="Eye" size={16} />
                        Просмотр
                      </Button>
                      {act.is_draft && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAct(act.id)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={16} />
                          Удалить
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали акта {selectedAct?.act_number}</DialogTitle>
            <DialogDescription>Полная информация об акте списания</DialogDescription>
          </DialogHeader>

          {selectedAct && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Дата акта</p>
                  <p className="font-medium">{new Date(selectedAct.act_date).toLocaleDateString('ru-RU')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Статус</p>
                  <p className="font-medium">
                    {selectedAct.is_draft ? (
                      <Badge variant="secondary" className="gap-1">
                        <Icon name="FileEdit" size={12} />
                        Черновик (списание не проведено)
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <Icon name="CheckCircle" size={12} />
                        Проведён (списание выполнено)
                      </Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ответственное лицо</p>
                  <p className="font-medium">{selectedAct.responsible_person}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Основание</p>
                  <p className="font-medium">{selectedAct.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Создан</p>
                  <p className="font-medium">
                    {new Date(selectedAct.created_at).toLocaleDateString('ru-RU')} ({selectedAct.created_by})
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Списанные товары</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Наименование</TableHead>
                      <TableHead>Инв. номер</TableHead>
                      <TableHead>Количество</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Причина</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAct.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.inventory_number}</TableCell>
                        <TableCell>{formatQuantity(item.quantity)}</TableCell>
                        <TableCell>{item.price.toFixed(2)} ₽</TableCell>
                        <TableCell className="font-semibold">
                          {(item.quantity * item.price).toFixed(2)} ₽
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.reason}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-semibold">Итого:</TableCell>
                      <TableCell className="font-bold text-lg">
                        {getTotalSum(selectedAct.items).toFixed(2)} ₽
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}