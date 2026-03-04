import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Minus,
  Plus,
  MessageCircle,
  Star,
  ThumbsUp,
  Send,
  Loader2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ProductCard } from '../components/ProductCard';
import { TechSpecsTable } from '../components/TechSpecsTable';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const IMAGE_BASE_URL = 'https://localhost:7033';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  discount: number;
  rating: number;
  reviewCount: number;
  techSpecs: string | null;
}

interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  likes: number;
}

interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  rating: number;
  discount?: number;
  reviews?: number;
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  // Review form state
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
    }
  }, [id]);

  const loadProduct = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://localhost:7033/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();

        console.log('Product API Response:', data);
        console.log('ImageUrl from API:', data.imageUrl || data.ImageUrl); // Debug

        const imageUrl = data.imageUrl || data.ImageUrl || '';

        setProduct({
          id: data.id || data.Id,
          name: data.name || data.Name,
          description: data.description || data.Description || '',
          price: data.price || data.Price,
          originalPrice: data.originalPrice || data.OriginalPrice || data.price || data.Price,
          stock: data.stock || data.Stock || 0,
          imageUrl: getImageUrl(imageUrl), // Sử dụng hàm xử lý
          categoryId: data.categoryId || data.CategoryId,
          categoryName: data.categoryName || data.CategoryName || 'Linh kiện',
          discount: data.discount || data.Discount || 0,
          rating: data.rating || data.Rating || 0,
          reviewCount: data.reviewCount || data.ReviewCount || data.reviews || data.Reviews || 0,
          techSpecs: data.techSpecs || data.TechSpecs || null,
        });

        // Load related products
        loadRelatedProducts(data.categoryId || data.CategoryId);
      } else {
        console.error('Product not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Load product error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedProducts = async (categoryId: number) => {
    try {
      const response = await fetch(`https://localhost:7033/api/products?categoryId=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        const products = (data.products || data || [])
          .filter((p: any) => (p.id || p.Id) !== parseInt(id || '0'))
          .slice(0, 4)
          .map((p: any) => ({
            id: p.id || p.Id,
            name: p.name || p.Name,
            price: p.price || p.Price,
            originalPrice: p.originalPrice || p.OriginalPrice || p.price || p.Price,
            imageUrl: getImageUrl(p.imageUrl || p.ImageUrl), // Sử dụng hàm xử lý
            rating: p.rating || p.Rating || 0,
            discount: p.discount || p.Discount || 0,
            reviews: p.reviews || p.Reviews || 0,
          }));
        setRelatedProducts(products);
      }
    } catch (error) {
      console.error('Load related products error:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`https://localhost:7033/api/products/${id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || data || []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Load reviews error:', error);
      setReviews([]);
    }
  };

  const extractBrand = (name: string): string => {
    const brands = ['Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Samsung', 'WD', 'Seagate', 'Kingston', 'Crucial'];
    for (const brand of brands) {
      if (name.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    return 'N/A';
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
      }, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
      }, quantity);
      navigate('/checkout');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      setReviewMessage({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá' });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7033/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReviewMessage({ type: 'success', text: 'Đánh giá của bạn đã được gửi!' });
        setNewReview({ rating: 5, comment: '' });

        // Thêm review mới vào list
        if (data.review) {
          setReviews([data.review, ...reviews]);
        } else {
          loadReviews();
        }

        // Reload product để cập nhật rating
        loadProduct();
      } else {
        const error = await response.json();
        setReviewMessage({ type: 'error', text: error.message || 'Gửi đánh giá thất bại' });
      }
    } catch (error) {
      console.error('Submit review error:', error);
      setReviewMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) {
      return 'https://via.placeholder.com/600x600?text=No+Image';
    }

    // Nếu đã là URL đầy đủ
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Nếu là đường dẫn tương đối
    if (imageUrl.startsWith('/')) {
      return `${IMAGE_BASE_URL}${imageUrl}`;
    }

    return `${IMAGE_BASE_URL}/${imageUrl}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải sản phẩm...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h1>
          <Link to="/">
            <Button className="bg-red-600 hover:bg-red-700">Về trang chủ</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link to="/" className="text-slate-600 hover:text-red-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to={`/category/${product.categoryId}`} className="text-slate-600 hover:text-red-600 transition-colors">
            {product.categoryName}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left: Image */}
          <div className="space-y-4">
            <div className="relative bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-200 aspect-square">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  Giảm {product.discount}%
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < product.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-slate-600 font-medium">{product.rating}/5</span>
                </div>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">{product.reviewCount || reviews.length} đánh giá</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600">Thương hiệu: <strong>{extractBrand(product.name)}</strong></span>
              </div>
            </div>

            {/* Price */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 p-6">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-red-600">{formatPrice(product.price)}</span>
                {product.discount > 0 && product.originalPrice > product.price && (
                  <span className="text-xl text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {product.discount > 0 && (
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-red-900 rounded-full text-sm font-bold">
                    Tiết kiệm {product.discount}%
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-sm font-bold">
                    Còn hàng ({product.stock})
                  </span>
                ) : (
                  <span className="inline-block px-4 py-1.5 bg-gray-500 text-white rounded-full text-sm font-bold">
                    Hết hàng
                  </span>
                )}
              </div>
            </Card>

            {/* Quantity Selector */}
            <div>
              <label className="block font-bold text-slate-900 mb-3">Số lượng:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-slate-100 transition-colors"
                    disabled={product.stock === 0}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center font-bold text-lg border-x-2 border-slate-200 py-3 focus:outline-none"
                    min="1"
                    max={product.stock}
                    disabled={product.stock === 0}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-3 hover:bg-slate-100 transition-colors"
                    disabled={product.stock === 0 || quantity >= product.stock}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-slate-500">
                  ({product.stock} sản phẩm có sẵn)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full h-14 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock > 0 ? 'MUA NGAY' : 'HẾT HÀNG'}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  variant="outline"
                  className="h-12 border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold rounded-xl disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  THÊM VÀO GIỎ
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-2 border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 font-bold rounded-xl"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  TƯ VẤN
                </Button>
              </div>
            </div>

            {/* Additional Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => product && toggleWishlist(product.id)}
                className={`flex items-center gap-2 transition-colors ${product && isInWishlist(product.id)
                    ? 'text-red-600'
                    : 'text-slate-600 hover:text-red-600'
                  }`}
              >
                <Heart className={`w-5 h-5 ${product && isInWishlist(product.id) ? 'fill-red-500' : ''}`} />
                <span>{product && isInWishlist(product.id) ? 'Đã yêu thích' : 'Yêu thích'}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Card className="p-6 mb-12">
          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 font-bold transition-all whitespace-nowrap ${activeTab === 'description'
                ? 'text-red-600 border-b-4 border-red-600'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              MÔ TẢ SẢN PHẨM
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-3 font-bold transition-all whitespace-nowrap ${activeTab === 'specs'
                ? 'text-red-600 border-b-4 border-red-600'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              THÔNG SỐ KỸ THUẬT
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-bold transition-all whitespace-nowrap ${activeTab === 'reviews'
                ? 'text-red-600 border-b-4 border-red-600'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              ĐÁNH GIÁ ({product.reviewCount || reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{product.name}</h3>
                {product.description ? (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                )}

                {/* Highlights */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">✓</span>
                    </div>
                    <div>
                      <p className="font-medium">Bảo hành chính hãng</p>
                      <p className="text-sm text-gray-500">36 tháng</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-lg">🚚</span>
                    </div>
                    <div>
                      <p className="font-medium">Giao hàng miễn phí</p>
                      <p className="text-sm text-gray-500">Đơn từ 500K</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-lg">🔄</span>
                    </div>
                    <div>
                      <p className="font-medium">Đổi trả dễ dàng</p>
                      <p className="text-sm text-gray-500">Trong 7 ngày</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-lg">💯</span>
                    </div>
                    <div>
                      <p className="font-medium">Sản phẩm chính hãng</p>
                      <p className="text-sm text-gray-500">100% authentic</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              {/* TechSpecs từ database */}
              <TechSpecsTable
                techSpecs={product.techSpecs}
                categoryId={product.categoryId}
                productName={product.name}
              />

              {/* Fallback: Thông tin từ Description nếu không có TechSpecs */}
              {!product.techSpecs && product.description && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-bold text-blue-800 mb-2">📋 Mô tả chi tiết từ nhà sản xuất:</h4>
                  <p className="text-blue-700 whitespace-pre-line">{product.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600">{product.rating}/5</div>
                  <div className="flex items-center justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{product.reviewCount || reviews.length} đánh giá</p>
                </div>
              </div>

              {/* Write Review Form */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">
                  {user ? 'Viết đánh giá của bạn' : 'Đăng nhập để đánh giá'}
                </h4>

                {reviewMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${reviewMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {reviewMessage.text}
                  </div>
                )}

                {user ? (
                  <>
                    {/* Rating Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá:</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-8 h-8 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-gray-600">{newReview.rating}/5</span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét:</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                      />
                    </div>

                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || !newReview.comment.trim()}
                      className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    >
                      {isSubmittingReview ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                  </>
                ) : (
                  <Link to="/login">
                    <Button className="bg-red-600 hover:bg-red-700">
                      Đăng nhập để đánh giá
                    </Button>
                  </Link>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold">
                          {review.userName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{review.userName}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{formatDate(review.createdAt)}</p>
                          <p className="text-gray-700">{review.comment}</p>
                          <button className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-blue-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Hữu ích ({review.likes})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Sản phẩm liên quan</h2>
              <Link to={`/category/${product.categoryId}`} className="text-red-600 hover:text-red-700 font-medium">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  image={item.imageUrl}
                  rating={item.rating}
                  discount={item.discount}
                  reviews={item.reviews}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}