import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShoppingCart, Ticket, X, Check, ChevronDown } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getMyVouchers, validateVoucher, Voucher } from '../../services/api';

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

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountPercent: number } | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const voucherRef = useRef<HTMLDivElement>(null);

  // Tính giảm giá
  const discountAmount = appliedVoucher
    ? Math.round(totalPrice * appliedVoucher.discountPercent / 100)
    : 0;
  const finalTotal = totalPrice - discountAmount;

  // Load voucher của user
  useEffect(() => {
    if (isAuthenticated) {
      getMyVouchers().then(setMyVouchers);
    }
  }, [isAuthenticated]);

  // Click outside đóng dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (voucherRef.current && !voucherRef.current.contains(e.target as Node)) {
        setShowVoucherDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) return;
    setVoucherLoading(true);
    setVoucherError('');
    setVoucherSuccess('');
    try {
      const result = await validateVoucher(code);
      if (result.valid && result.discountPercent) {
        setAppliedVoucher({ code, discountPercent: result.discountPercent });
        setVoucherSuccess(`Áp dụng thành công! Giảm ${result.discountPercent}%`);
        setShowVoucherDropdown(false);
      } else {
        setVoucherError(result.message || 'Mã không hợp lệ');
      }
    } catch {
      setVoucherError('Có lỗi xảy ra');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleSelectVoucher = (voucher: Voucher) => {
    setVoucherCode(voucher.code);
    setAppliedVoucher({ code: voucher.code, discountPercent: voucher.discountPercent });
    setVoucherSuccess(`Áp dụng thành công! Giảm ${voucher.discountPercent}%`);
    setVoucherError('');
    setShowVoucherDropdown(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherSuccess('');
    setVoucherError('');
  };

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
      navigate('/checkout', {
        state: appliedVoucher ? {
          voucherCode: appliedVoucher.code,
          discountPercent: appliedVoucher.discountPercent,
          discountAmount: discountAmount,
        } : undefined
      });
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
                  <span className="text-red-600 font-medium">-{formatPrice(discountAmount)}</span>
                </div>
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-red-600">{formatPrice(finalTotal)}</span>
              </div>

              {/* Voucher Input + Dropdown */}
              <div className="mb-4" ref={voucherRef}>
                {appliedVoucher ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <Ticket className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-green-700">{appliedVoucher.code}</span>
                      <span className="text-xs text-green-600 ml-2">-{appliedVoucher.discountPercent}%</span>
                    </div>
                    <button onClick={handleRemoveVoucher} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Nhập mã giảm giá"
                          value={voucherCode}
                          onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(''); }}
                          onFocus={() => { if (isAuthenticated && myVouchers.length > 0) setShowVoucherDropdown(true); }}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 pr-8"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleApplyVoucher(); }}
                        />
                        {isAuthenticated && myVouchers.length > 0 && (
                          <button
                            onClick={() => setShowVoucherDropdown(!showVoucherDropdown)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${showVoucherDropdown ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                        onClick={handleApplyVoucher}
                        disabled={voucherLoading || !voucherCode.trim()}
                      >
                        {voucherLoading ? '...' : 'Áp dụng'}
                      </Button>
                    </div>

                    {/* Dropdown danh sách voucher */}
                    {showVoucherDropdown && myVouchers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                        <div className="px-3 py-2 bg-gray-50 border-b">
                          <p className="text-xs font-medium text-gray-500">Voucher của bạn</p>
                        </div>
                        {myVouchers.map((v) => (
                          <button
                            key={v.code}
                            onClick={() => handleSelectVoucher(v)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 transition-colors text-left"
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Ticket className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 tracking-wide">{v.code}</p>
                              <p className="text-xs text-orange-600">Giảm {v.discountPercent}% toàn bộ đơn hàng</p>
                            </div>
                            <span className="text-lg font-bold text-red-600">-{v.discountPercent}%</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {voucherError && (
                  <p className="text-xs text-red-500 mt-1">{voucherError}</p>
                )}
                {voucherSuccess && !appliedVoucher && (
                  <p className="text-xs text-green-600 mt-1">{voucherSuccess}</p>
                )}
                {!isAuthenticated && (
                  <p className="text-xs text-gray-400 mt-1">
                    <Link to="/login" className="text-red-500 hover:underline">Đăng nhập</Link> để sử dụng voucher
                  </p>
                )}
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