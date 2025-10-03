import { useState, useEffect } from 'react';

interface OfflineData {
  products: any[];
  movements: any[];
  lastSync: number;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    const stored = localStorage.getItem('offline-stock-data');
    if (stored) {
      setOfflineData(JSON.parse(stored));
    }
  };

  const saveOfflineData = (data: Partial<OfflineData>) => {
    const current = offlineData || { products: [], movements: [], lastSync: 0 };
    const updated = { ...current, ...data, lastSync: Date.now() };
    localStorage.setItem('offline-stock-data', JSON.stringify(updated));
    setOfflineData(updated);
  };

  const clearOfflineData = () => {
    localStorage.removeItem('offline-stock-data');
    setOfflineData(null);
  };

  return {
    isOnline,
    offlineData,
    saveOfflineData,
    clearOfflineData
  };
}
