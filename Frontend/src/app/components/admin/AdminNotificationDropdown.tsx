import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingCart, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { API_URL } from '@/config';

interface Notification {
  type: 'new_order' | 'low_stock' | 'out_of_stock';
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

interface NotificationResponse {
  items: Notification[];
  unreadCount: number;
}

export function AdminNotificationDropdown() {
  const [data, setData] = useState<NotificationResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/notifications`, {
        credentials: 'include',
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  };

  // Initial fetch + polling mỗi 30 giây
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Click outside → close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (item: Notification) => {
    setIsOpen(false);
    if (item.type === 'new_order') {
      navigate('/admin/orders');
    } else {
      navigate('/admin/products');
    }
  };

  const handleMarkAllRead = () => {
    setDismissed(true);
    setIsOpen(false);
  };

  const unreadCount = dismissed ? 0 : (data?.unreadCount || 0);

  const iconMap = {
    new_order: { icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
    low_stock: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600' },
    out_of_stock: { icon: XCircle, color: 'bg-red-100 text-red-600' },
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications(); // Refresh khi mở
        }}
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="font-semibold text-sm">Thông báo</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} mới</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-slate-300 hover:text-white transition-colors">
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {(!data || data.items.length === 0) ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Không có thông báo mới</p>
              </div>
            ) : (
              data.items.map((item, idx) => {
                const { icon: Icon, color } = iconMap[item.type] || iconMap.new_order;
                return (
                  <button
                    key={`${item.type}-${item.id}-${idx}`}
                    onClick={() => handleClick(item)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{item.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{timeAgo(item.createdAt)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {data && data.items.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => { setIsOpen(false); navigate('/admin/orders'); }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold w-full text-center"
              >
                Xem tất cả đơn hàng →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
