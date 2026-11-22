import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/95 px-3.5 py-2 text-xs font-medium text-amber-900 dark:text-amber-200 shadow-lg no-print"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
      <span>حالت آفلاین — تمام ۵ مجموعه داده به‌صورت محلی فعال هستند.</span>
    </div>
  );
};
