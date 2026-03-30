import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ShoppingCart, Users, X } from 'lucide-react';
import { API_URL } from '@/config';

interface SearchResult {
  products: Array<{ id: number; name: string; price: number; stock: number; image?: string }>;
  orders: Array<{ id: number; orderCode: string; shippingFullName: string; totalAmount: number; status: string; createdAt: string }>;
  customers: Array<{ id: number; fullName: string; email: string; phoneNumber?: string }>;
}

export function AdminSearchDropdown() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Click outside → close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/admin/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults = results && (results.products.length > 0 || results.orders.length > 0 || results.customers.length > 0);

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
    shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div ref={searchRef} className="relative w-96 hidden md:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && results && setIsOpen(true)}
        placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
        className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      />
      {query && (
        <button onClick={() => { setQuery(''); setIsOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-[480px] overflow-y-auto z-50">
          {loading && (
            <div className="p-4 text-center text-slate-400">
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!loading && !hasResults && (
            <div className="p-6 text-center text-slate-400">Không tìm thấy kết quả cho "{query}"</div>
          )}

          {!loading && hasResults && (
            <>
              {/* Products */}
              {results!.products.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" /> Sản phẩm ({results!.products.length})
                  </div>
                  {results!.products.map((p) => (
                    <button key={`p-${p.id}`} onClick={() => handleNavigate('/admin/products')}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                        {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 m-2.5 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.price.toLocaleString('vi-VN')}₫ · Kho: {p.stock}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Orders */}
              {results!.orders.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5" /> Đơn hàng ({results!.orders.length})
                  </div>
                  {results!.orders.map((o) => (
                    <button key={`o-${o.id}`} onClick={() => handleNavigate('/admin/orders')}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">#{o.orderCode}</p>
                        <p className="text-xs text-slate-500">{o.shippingFullName} · {o.totalAmount.toLocaleString('vi-VN')}₫</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusMap[o.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                        {statusMap[o.status]?.label || o.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Customers */}
              {results!.customers.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Khách hàng ({results!.customers.length})
                  </div>
                  {results!.customers.map((c) => (
                    <button key={`c-${c.id}`} onClick={() => handleNavigate('/admin/customers')}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{c.fullName}</p>
                        <p className="text-xs text-slate-500">{c.email}{c.phoneNumber ? ` · ${c.phoneNumber}` : ''}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
