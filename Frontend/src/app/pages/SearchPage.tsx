import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, Package, ChevronDown } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard, Product } from '../components/ProductCard';
import { Button } from '../components/ui/button';

import { IMAGE_BASE_URL, API_URL } from '@/config';

const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) { if (imageUrl.includes('localhost')) { try { return `${IMAGE_BASE_URL}/${new URL(imageUrl).pathname.replace(/^\/+/, '')}`; } catch(e){} } return imageUrl; }
  return `${IMAGE_BASE_URL}/${imageUrl.replace(/^\/+/, '')}`;
};

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Liên quan nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
];

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (query) {
      searchProducts();
    } else {
      setProducts([]);
      setTotalResults(0);
      setIsLoading(false);
    }
  }, [query, sortBy, priceRange, selectedCategories]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        const categoryList = Array.isArray(data) ? data : (data.items || data.categories || []);
        setCategories(categoryList.map((c: any) => ({
          id: c.id || c.Id,
          name: c.name || c.Name
        })));
      }
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const searchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/products`);

      if (response.ok) {
        const data = await response.json();
        const productList = Array.isArray(data) ? data : (data.products || data.items || []);

        const searchLower = query.toLowerCase().trim();

        // ===== LỌC SẢN PHẨM THEO TÊN, CATEGORY, MÔ TẢ =====
        const filteredProducts = productList.filter((p: any) => {
          const name = (p.name || p.Name || '').toLowerCase();
          const categoryName = (p.categoryName || p.CategoryName || p.category?.name || p.Category?.Name || '').toLowerCase();
          const description = (p.description || p.Description || '').toLowerCase();

          return name.includes(searchLower) ||
            categoryName.includes(searchLower) ||
            description.includes(searchLower);
        });

        // Map sang interface Product
        const mappedProducts: Product[] = filteredProducts.map((p: any) => {
          const price = p.price || p.Price || 0;
          const discount = p.discount || p.Discount || 0;
          const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
          const rawImageUrl = p.imageUrl || p.ImageUrl || p.image || p.Image || '';

          return {
            id: p.id || p.Id,
            name: p.name || p.Name || '',
            price: finalPrice,
            originalPrice: discount > 0 ? price : undefined,
            image: getImageUrl(rawImageUrl),
            rating: p.rating || p.Rating || 0,
            reviews: p.reviews || p.Reviews || 0,
            discount: discount > 0 ? discount : undefined,
            categoryId: p.categoryId || p.CategoryId,
          };
        });

        // Filter giá
        let finalProducts = mappedProducts.filter(p => {
          const productPrice = p.originalPrice || p.price;
          return productPrice >= priceRange[0] && productPrice <= priceRange[1];
        });

        // Filter danh mục
        if (selectedCategories.length > 0) {
          finalProducts = finalProducts.filter(p =>
            p.categoryId && selectedCategories.includes(p.categoryId)
          );
        }

        const sortedProducts = sortProducts(finalProducts, sortBy);

        setProducts(sortedProducts);
        setTotalResults(sortedProducts.length);
      } else {
        setProducts([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const sortProducts = (products: Product[], sort: SortOption): Product[] => {
    const sorted = [...products];
    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.reverse();
      default:
        return sorted;
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 50000000]);
    setSelectedCategories([]);
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Tìm kiếm: "{query}"</span>
        </div>

        {/* Search Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Search className="w-6 h-6 text-red-600" />
                Kết quả tìm kiếm
              </h1>
              <p className="text-gray-500 mt-1">
                {isLoading ? 'Đang tìm kiếm...' : `Tìm thấy ${totalResults} sản phẩm cho "${query}"`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Lọc
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-xl p-4 shadow-sm border sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Bộ lọc
                </h3>
                {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000000) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Khoảng giá</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={priceRange[0] || ''}
                      onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-gray-400 self-center">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      value={priceRange[1] === 50000000 ? '' : priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 50000000])}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Dưới 1 triệu', range: [0, 1000000] as [number, number] },
                      { label: '1-5 triệu', range: [1000000, 5000000] as [number, number] },
                      { label: '5-10 triệu', range: [5000000, 10000000] as [number, number] },
                      { label: 'Trên 10 triệu', range: [10000000, 50000000] as [number, number] },
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setPriceRange(item.range)}
                        className={`px-2 py-1 text-xs rounded-lg border transition-colors ${priceRange[0] === item.range[0] && priceRange[1] === item.range[1]
                          ? 'bg-red-600 text-white border-red-600'
                          : 'hover:border-red-600 hover:text-red-600'
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Danh mục</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 cursor-pointer hover:text-red-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tìm kiếm sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Không tìm thấy sản phẩm
                </h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Rất tiếc, không có sản phẩm nào phù hợp với từ khóa "<span className="font-semibold text-red-600">{query}</span>" trong cửa hàng của chúng tôi.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">💡 Gợi ý tìm kiếm:</p>
                  <ul className="text-sm text-gray-500 text-left list-disc list-inside space-y-1">
                    <li>Kiểm tra lỗi chính tả của từ khóa</li>
                    <li>Thử tìm với từ khóa ngắn hơn hoặc tổng quát hơn</li>
                    <li>Sử dụng tên thương hiệu (Intel, AMD, NVIDIA...)</li>
                    <li>Thử các từ khóa liên quan khác</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/">
                    <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                      🏠 Về trang chủ
                    </Button>
                  </Link>
                  <Link to="/category/cpu">
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                      🔍 Xem tất cả sản phẩm
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <p className="text-sm text-gray-500 mb-3">Từ khóa phổ biến:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Intel Core i9', 'RTX 4080', 'AMD Ryzen', 'RAM DDR5', 'SSD NVMe'].map((keyword) => (
                      <Link
                        key={keyword}
                        to={`/search?q=${encodeURIComponent(keyword)}`}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full text-sm transition-colors"
                      >
                        {keyword}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'flex flex-col gap-4'
              }>
                {products.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}