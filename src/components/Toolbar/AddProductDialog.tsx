import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newProduct: {
    name: string;
    inventory_number: string;
    quantity: number;
    min_stock: number;
    price: number;
    batch: string;
    unit: string;
  };
  onProductChange: (product: any) => void;
  onSubmit: () => void;
  isAdmin: boolean;
}

export function AddProductDialog({
  open,
  onOpenChange,
  newProduct,
  onProductChange,
  onSubmit,
  isAdmin
}: AddProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-2 text-sm font-normal" disabled={!isAdmin}>
          <Icon name="Plus" size={16} />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новый товар</DialogTitle>
          <DialogDescription>Заполните информацию о новом товаре</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Название</Label>
            <Input 
              id="name" 
              className="col-span-3" 
              value={newProduct.name}
              onChange={(e) => onProductChange({ ...newProduct, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inventory_number" className="text-right">Инвентарный номер</Label>
            <Input 
              id="inventory_number" 
              className="col-span-3"
              value={newProduct.inventory_number}
              onChange={(e) => onProductChange({ ...newProduct, inventory_number: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">Количество</Label>
            <Input 
              id="quantity" 
              type="number" 
              step="0.001"
              className="col-span-3"
              value={newProduct.quantity}
              onChange={(e) => onProductChange({ ...newProduct, quantity: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="min_stock" className="text-right">Мин. остаток</Label>
            <Input 
              id="min_stock" 
              type="number" 
              step="0.001"
              className="col-span-3"
              value={newProduct.min_stock}
              onChange={(e) => onProductChange({ ...newProduct, min_stock: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">Цена</Label>
            <Input 
              id="price" 
              type="number" 
              className="col-span-3"
              value={newProduct.price}
              onChange={(e) => onProductChange({ ...newProduct, price: parseFloat(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="batch" className="text-right">Партия</Label>
            <Input 
              id="batch" 
              className="col-span-3"
              value={newProduct.batch}
              onChange={(e) => onProductChange({ ...newProduct, batch: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">Ед. измерения</Label>
            <Select 
              value={newProduct.unit} 
              onValueChange={(val) => onProductChange({ ...newProduct, unit: val })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите единицу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="шт">шт (штуки)</SelectItem>
                <SelectItem value="кг">кг (килограммы)</SelectItem>
                <SelectItem value="г">г (граммы)</SelectItem>
                <SelectItem value="л">л (литры)</SelectItem>
                <SelectItem value="мл">мл (миллилитры)</SelectItem>
                <SelectItem value="м">м (метры)</SelectItem>
                <SelectItem value="см">см (сантиметры)</SelectItem>
                <SelectItem value="м²">м² (квадратные метры)</SelectItem>
                <SelectItem value="м³">м³ (кубические метры)</SelectItem>
                <SelectItem value="упак">упак (упаковки)</SelectItem>
                <SelectItem value="компл">компл (комплекты)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="mt-4" onClick={onSubmit}>Сохранить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}