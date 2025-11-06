import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onImport: () => void;
  isAdmin: boolean;
}

export function ImportDialog({
  open,
  onOpenChange,
  selectedFile,
  onFileChange,
  onImport,
  isAdmin
}: ImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-2 text-sm font-normal" disabled={!isAdmin}>
          <Icon name="Upload" size={16} />
          Импорт
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Импорт из Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Загрузите Excel файл с товарами. Файл должен содержать колонки: Название, Инвентарный номер, Количество, Единица измерения, Мин. остаток, Цена, Партия
          </p>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          />
          {selectedFile && (
            <p className="text-sm">Выбран файл: {selectedFile.name}</p>
          )}
          <Button className="w-full" onClick={onImport} disabled={!selectedFile}>
            <Icon name="Upload" size={18} className="mr-2" />
            Импортировать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}