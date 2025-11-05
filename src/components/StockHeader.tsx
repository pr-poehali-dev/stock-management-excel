import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { NotificationCenter } from "@/components/NotificationCenter";

interface StockHeaderProps {
  isOnline: boolean;
  isAdmin: boolean;
  userName?: string;
  onLogout: () => void;
  stockData: any[];
  loading?: boolean;
}

export const StockHeader = ({ isOnline, isAdmin, userName, onLogout, stockData, loading }: StockHeaderProps) => {
  return (
    <div className="border-b bg-[#217346] text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Складской учёт</h1>
        {loading && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/20 text-white text-xs font-medium">
            <Icon name="Loader2" size={12} className="animate-spin" />
            Загрузка...
          </span>
        )}
        {!isOnline && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-500 text-white text-xs font-medium">
            <Icon name="WifiOff" size={12} />
            Офлайн
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <NotificationCenter stockData={stockData} />
        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded">
          <Icon name={isAdmin ? "Shield" : "User"} size={16} />
          <span className="text-sm">{userName}</span>
        </div>
        <Button variant="ghost" onClick={onLogout} className="gap-2 text-white hover:bg-white/20">
          <Icon name="LogOut" size={16} />
        </Button>
      </div>
    </div>
  );
};