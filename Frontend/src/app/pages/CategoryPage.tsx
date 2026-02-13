import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, Grid, List, Package } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard, Product } from '../components/ProductCard';

const IMAGE_BASE_URL = 'https://localhost:7033';

const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${IMAGE_BASE_URL}${imageUrl}`;
  return `${IMAGE_BASE_URL}/${imageUrl}`;
};

interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export function CategoryPage() {
  // SỬA: Nhận categoryId thay vì slug
  const { categoryId } = useParams<{ categoryId: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [totalProducts, setTotalProducts] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (categoryId) {
      loadProducts();
    }
  }, [categoryId, sortBy]);

  // Lấy sản phẩm theo category slug (backend đã có mapping slug → categoryId)
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Dùng endpoint slug-based: /api/products/category/{slug}
      const url = `https://localhost:7033/api/products/category/${categoryId}`;
      console.log('Calling API:', url);

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Danh mục không tồn tại');
          setProducts([]);
          setTotalProducts(0);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Response format: { category: { id, name, slug }, products: [...], total: N }
      if (data.category) {
        setCategory({
          id: data.category.id,
          name: data.category.name,
          slug: data.category.slug || categoryId || '',
          productCount: data.total || 0,
        });
      }

      const productList = data.products || [];
      const total = data.total || productList.length;

      console.log(`Found ${productList.length} products for category "${categoryId}"`);

      // Map sang interface Product
      const mappedProducts: Product[] = productList.map((p: any) => {
        const price = p.price || p.Price || 0;
        const discount = p.discount || p.Discount || 0;
        const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
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

      // Sort
      const sortedProducts = sortProducts(mappedProducts, sortBy);

      setProducts(sortedProducts);
      setTotalProducts(total);

    } catch (err) {
      console.error('Load products error:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
      setTotalProducts(0);
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

  const displayName = category?.name || 'Tất cả sản phẩm';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Category Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <p className="text-white/80 mt-1">{category?.productCount || totalProducts} sản phẩm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{displayName}</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Tìm thấy <span className="font-bold text-red-600">{totalProducts}</span> sản phẩm
          </p>

          <div className="flex items-center gap-4">
            {/* View Mode */}
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

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="default">Sắp xếp: Mặc định</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="newest">Mới nhất</option>
                <option value="rating">Đánh giá cao</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải sản phẩm...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
            <Link to="/" className="text-red-600 hover:underline">
              Về trang chủ
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không có sản phẩm</h2>
            <p className="text-gray-500 mb-4">Danh mục này chưa có sản phẩm nào.</p>
            <Link to="/" className="text-red-600 hover:underline">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'flex flex-col gap-4'
          }>
            {products.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}