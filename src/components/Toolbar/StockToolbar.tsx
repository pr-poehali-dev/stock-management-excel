import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { ImportDialog } from "./ImportDialog";
import { AddProductDialog } from "./AddProductDialog";

interface StockToolbarProps {
  isAdmin: boolean;
  onExport: () => void;
  onClearDatabase: () => void;
  importOpen: boolean;
  onImportOpenChange: (open: boolean) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onImport: () => void;
  newProductOpen: boolean;
  onNewProductOpenChange: (open: boolean) => void;
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
  onAddProduct: () => void;
}

export function StockToolbar({
  isAdmin,
  onExport,
  onClearDatabase,
  importOpen,
  onImportOpenChange,
  selectedFile,
  onFileChange,
  onImport,
  newProductOpen,
  onNewProductOpenChange,
  newProduct,
  onProductChange,
  onAddProduct
}: StockToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="ghost" className="gap-2 text-sm font-normal" onClick={onExport}>
        <Icon name="Download" size={16} />
        Скачать
      </Button>
      <ImportDialog
        open={importOpen}
        onOpenChange={onImportOpenChange}
        selectedFile={selectedFile}
        onFileChange={onFileChange}
        onImport={onImport}
        isAdmin={isAdmin}
      />
      {isAdmin && (
        <Button 
          size="sm" 
          variant="ghost" 
          className="gap-2 text-sm font-normal text-destructive hover:text-destructive hover:bg-destructive/10" 
          onClick={onClearDatabase}
        >
          <Icon name="Trash2" size={16} />
          Очистить базу
        </Button>
      )}
      <AddProductDialog
        open={newProductOpen}
        onOpenChange={onNewProductOpenChange}
        newProduct={newProduct}
        onProductChange={onProductChange}
        onSubmit={onAddProduct}
        isAdmin={isAdmin}
      />
    </div>
  );
}
