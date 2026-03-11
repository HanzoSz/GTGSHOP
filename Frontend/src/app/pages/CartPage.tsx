import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import { IMAGE_BASE_URL } from '@/config';

const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return 'https://via.placeholder.com/100x100?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${IMAGE_BASE_URL}${imageUrl}`;
  return `${IMAGE_BASE_URL}/${imageUrl}`;
};

export function CartPage() {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Chuyển đến trang đăng nhập, sau đó quay lại checkout
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h1>
            <p className="text-gray-500 mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi!
            </p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Giỏ hàng</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            🛒 Giỏ hàng của bạn
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({totalItems} sản phẩm)
            </span>
          </h1>
          <Button
            variant="outline"
            onClick={clearCart}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa tất cả
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl p-4 shadow-sm border flex gap-4"
              >
                {/* Product Image */}
                <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productId}`}>
                    <h3 className="font-medium text-gray-800 hover:text-red-600 line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="text-red-600 font-bold text-lg mt-2">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-bold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính ({totalItems} sản phẩm)</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giảm giá</span>
                  <span className="text-red-600 font-medium">-{formatPrice(0)}</span>
                </div>
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-red-600">{formatPrice(totalPrice)}</span>
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                    Áp dụng
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 py-3 text-lg"
              >
                Tiến hành thanh toán
              </Button>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span>🔒 Thanh toán an toàn</span>
                  <span>🚚 Freeship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}