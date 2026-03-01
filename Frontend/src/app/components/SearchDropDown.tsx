import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, TrendingUp, Clock, Package, ImageOff } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  discount: number;
  categoryName?: string;
}

interface SearchDropdownProps {
  className?: string;
}

const IMAGE_BASE_URL = 'https://localhost:7033';

// ===== FIX: Hàm xử lý URL hình ảnh =====
const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';

  // Nếu đã là URL đầy đủ
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Xử lý đường dẫn tương đối
  const cleanPath = imageUrl.replace(/^\/+/, '');
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const popularKeywords = [
  'RTX 4090',
  'Intel Core i9',
  'AMD Ryzen 7',
  'RAM DDR5',
  'SSD NVMe',
  'Mainboard ASUS',
];

// ===== Từ khóa danh mục để redirect =====
const categoryKeywords: { [key: string]: string } = {
  'cpu': 'cpu',
  'bộ vi xử lý': 'cpu',
  'processor': 'cpu',
  'vga': 'vga',
  'card đồ họa': 'vga',
  'card màn hình': 'vga',
  'graphics card': 'vga',
  'gpu': 'vga',
  'mainboard': 'mainboard',
  'bo mạch chủ': 'mainboard',
  'motherboard': 'mainboard',
  'ram': 'ram',
  'bộ nhớ': 'ram',
  'memory': 'ram',
  'ssd': 'ssd',
  'hdd': 'ssd',
  'ổ cứng': 'ssd',
  'storage': 'ssd',
  'case': 'case',
  'vỏ case': 'case',
  'thùng máy': 'case',
  'psu': 'psu',
  'nguồn': 'psu',
  'power supply': 'psu',
  'cooling': 'cooling',
  'tản nhiệt': 'cooling',
  'cooler': 'cooling',
  'fan': 'cooling',
  'quạt': 'cooling',
};

// ===== Component hiển thị hình ảnh với fallback =====
function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [src]);

  if (error || !src) {
    return (
      <div className="w-12 h-12 rounded-lg border bg-gray-100 flex items-center justify-center">
        <ImageOff className="w-5 h-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12">
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-12 h-12 object-cover rounded-lg border ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}

export function SearchDropdown({ className = '' }: SearchDropdownProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    try {
      // Lấy tất cả sản phẩm và lọc ở frontend
      const response = await fetch('https://localhost:7033/api/products');

      if (response.ok) {
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || data.items || []);

        const searchLower = searchQuery.toLowerCase().trim();

        // Lọc sản phẩm theo tên hoặc category
        const filteredProducts = products.filter((p: any) => {
          const name = (p.name || p.Name || '').toLowerCase();
          const categoryName = (p.categoryName || p.CategoryName || p.category?.name || p.Category?.Name || '').toLowerCase();
          const description = (p.description || p.Description || '').toLowerCase();

          return name.includes(searchLower) ||
            categoryName.includes(searchLower) ||
            description.includes(searchLower);
        });

        const mappedProducts = filteredProducts.slice(0, 6).map((p: any) => {
          const rawImageUrl = p.imageUrl || p.ImageUrl || p.image || p.Image || '';

          return {
            id: p.id || p.Id,
            name: p.name || p.Name || '',
            imageUrl: getImageUrl(rawImageUrl),
            price: p.price || p.Price || 0,
            discount: p.discount || p.Discount || 0,
            categoryName: p.categoryName || p.CategoryName || p.category?.name || p.Category?.Name || '',
          };
        });

        console.log('Search results:', mappedProducts);
        setSuggestions(mappedProducts);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (searchTerm?: string) => {
    const term = (searchTerm || query).trim().toLowerCase();

    if (!term) return;

    saveRecentSearch(term);
    setIsOpen(false);
    setQuery('');

    // ===== Kiểm tra nếu là từ khóa danh mục =====
    const categorySlug = categoryKeywords[term];
    if (categorySlug) {
      navigate(`/category/${categorySlug}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleProductClick = (productId: number) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/product/${productId}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm linh kiện PC (VGA, CPU, RAM, Case...)"
          className="w-full h-10 pl-4 pr-20 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {/* Search button */}
        <button
          type="button"
          onClick={() => handleSearch()}
          className="absolute right-1 top-1/2 -translate-y-1/2 theme-btn-search p-2 rounded-lg transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">

          {/* Loading */}
          {isLoading && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Đang tìm kiếm...</p>
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b">
                <p className="text-xs font-medium text-gray-500 uppercase">Sản phẩm gợi ý</p>
              </div>
              <div className="divide-y">
                {suggestions.map((product) => {
                  const finalPrice = product.discount > 0
                    ? product.price * (1 - product.discount / 100)
                    : product.price;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                    >
                      {/* ===== SỬ DỤNG COMPONENT HÌNH ẢNH MỚI ===== */}
                      <ProductImage src={product.imageUrl} alt={product.name} />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                        {product.categoryName && (
                          <p className="text-xs text-gray-500">{product.categoryName}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold theme-text-primary">{formatPrice(finalPrice)}</p>
                        {product.discount > 0 && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View all results */}
              <div
                onClick={() => handleSearch()}
                className="w-full p-3 text-center theme-text-primary hover:bg-red-50 font-medium border-t cursor-pointer"
              >
                Xem tất cả kết quả cho "{query}"
              </div>
            </div>
          )}

          {/* No results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-sm text-gray-400 mt-1">Thử tìm với từ khóa khác</p>
            </div>
          )}

          {/* Empty state - show recent & popular */}
          {!isLoading && query.length < 2 && (
            <div>
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Tìm kiếm gần đây
                    </p>
                    <span
                      onClick={clearRecentSearches}
                      className="text-xs theme-text-primary cursor-pointer"
                    >
                      Xóa tất cả
                    </span>
                  </div>
                  <div className="p-2">
                    {recentSearches.map((term, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearch(term)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg group text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {term}
                        </span>
                        <span
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-opacity cursor-pointer"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular keywords */}
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-t">
                  <p className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Từ khóa phổ biến
                  </p>
                </div>
                <div className="p-3 flex flex-wrap gap-2">
                  {popularKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      onClick={() => handleSearch(keyword)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full text-sm text-gray-700 transition-colors cursor-pointer"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}