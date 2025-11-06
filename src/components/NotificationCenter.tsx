import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockItem {
  id?: number;
  name: string;
  inventory_number: string;
  quantity: number;
  minStock: number;
  status: string;
}

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  productName: string;
  productInventoryNumber: string;
  currentStock: number;
  minStock: number;
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  stockData: StockItem[];
}

export function NotificationCenter({ stockData }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkStockLevels();
  }, [stockData]);

  const checkStockLevels = () => {
    if (!stockData || !Array.isArray(stockData)) {
      return;
    }

    const newNotifications: Notification[] = [];

    stockData.forEach((item) => {
      const criticalThreshold = item.minStock / 2;
      
      if (item.quantity === 0) {
        newNotifications.push({
          id: `${item.inventory_number}-out-${Date.now()}`,
          type: 'critical',
          title: 'Товар закончился',
          message: `${item.name} полностью отсутствует на складе`,
          productName: item.name,
          productInventoryNumber: item.inventory_number,
          currentStock: item.quantity,
          minStock: item.minStock,
          timestamp: new Date(),
          read: false
        });
      } else if (item.quantity <= criticalThreshold) {
        newNotifications.push({
          id: `${item.inventory_number}-critical-${Date.now()}`,
          type: 'critical',
          title: 'Критически низкий остаток',
          message: `${item.name} - осталось ${item.quantity} шт (требуется ${item.minStock} шт)`,
          productName: item.name,
          productInventoryNumber: item.inventory_number,
          currentStock: item.quantity,
          minStock: item.minStock,
          timestamp: new Date(),
          read: false
        });
      } else if (item.quantity <= item.minStock) {
        newNotifications.push({
          id: `${item.inventory_number}-warning-${Date.now()}`,
          type: 'warning',
          title: 'Низкий остаток',
          message: `${item.name} - осталось ${item.quantity} шт (минимум ${item.minStock} шт)`,
          productName: item.name,
          productInventoryNumber: item.inventory_number,
          currentStock: item.quantity,
          minStock: item.minStock,
          timestamp: new Date(),
          read: false
        });
      }
    });

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.productInventoryNumber));
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.productInventoryNumber));
      return [...uniqueNew, ...prev].slice(0, 50);
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return 'AlertTriangle';
      case 'warning':
        return 'AlertCircle';
      default:
        return 'Info';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-destructive bg-destructive/10';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Уведомления</h3>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Icon name="AlertTriangle" size={12} />
                {criticalCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Icon name="CheckCheck" size={14} />
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <Icon name="Trash2" size={14} />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length > 0 ? (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? 'border-l-4 border-l-primary' : 'opacity-70'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      <Icon name={getNotificationIcon(notification.type)} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {notification.productInventoryNumber}
                        </Badge>
                        <span>•</span>
                        <span>{notification.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon name="Bell" size={32} className="text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">Нет уведомлений</p>
              <p className="text-sm text-muted-foreground mt-1">
                Все товары в достаточном количестве
              </p>
            </div>
          )}
        </ScrollArea>

        {criticalCount > 0 && (
          <div className="p-3 border-t bg-destructive/5">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <Icon name="AlertTriangle" size={16} />
              <span className="font-medium">
                Требуется срочное пополнение {criticalCount} {criticalCount === 1 ? 'товара' : 'товаров'}
              </span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function StockAlerts({ stockData }: NotificationCenterProps) {
  const [alerts, setAlerts] = useState<StockItem[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const lowStockItems = stockData.filter(item => 
      item.quantity <= item.minStock && 
      item.quantity > item.minStock / 2 &&
      !dismissedAlerts.has(item.inventory_number)
    );
    setAlerts(lowStockItems);
  }, [stockData, dismissedAlerts]);

  const dismissAlert = (inventoryNumber: string) => {
    setDismissedAlerts(prev => new Set(prev).add(inventoryNumber));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      <Card className="p-4 border-yellow-600 bg-yellow-50">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Icon name="AlertCircle" className="text-yellow-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Требуется пополнение
            </h3>
            <div className="space-y-2">
              {alerts.map((item) => (
                <div key={item.inventory_number} className="flex items-center justify-between text-sm gap-2">
                  <span className="font-medium text-yellow-900">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-yellow-600 text-yellow-700">
                      {item.quantity} / {item.minStock} шт
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-yellow-200"
                      onClick={() => dismissAlert(item.inventory_number)}
                    >
                      <Icon name="X" size={14} className="text-yellow-700" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}