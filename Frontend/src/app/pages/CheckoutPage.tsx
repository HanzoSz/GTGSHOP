import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowLeft,
  Shield,
  Loader2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Danh sách 34 tỉnh thành Việt Nam
const provinces = [
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cần Thơ',
  'Đà Nẵng',
  'Đắk Lắk',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Nội',
  'Hải Phòng',
  'Hậu Giang',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lâm Đồng',
  'Long An',
  'Nghệ An',
  'Ninh Thuận',
  'Phú Yên',
  'Quảng Nam',
  'Quảng Ngãi',
  'Sóc Trăng',
  'Tây Ninh',
  'Thái Nguyên',
  'Thanh Hóa',
  'TP. Hồ Chí Minh',
  'Trà Vinh',
];

interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string; // Quận
  ward: string;     // Phường
  note: string;
}

type PaymentMethod = 'cod' | 'bank' | 'momo' | 'vnpay';

const IMAGE_BASE_URL = 'https://localhost:7033';

const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return 'https://via.placeholder.com/100x100?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${IMAGE_BASE_URL}${imageUrl}`;
  return `${IMAGE_BASE_URL}/${imageUrl}`;
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.fullName || '',
    phone: '', // Bỏ user?.phone vì User không có field này
    email: user?.email || '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const shippingFee = totalPrice >= 2000000 ? 0 : 30000;
  const finalTotal = totalPrice + shippingFee;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const validateShipping = () => {
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.district) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Format đúng theo backend API
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.name,
          productImage: item.image
        })),
        shippingFullName: shippingInfo.fullName,
        shippingPhone: shippingInfo.phone,
        shippingEmail: shippingInfo.email,
        shippingAddress: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingDistrict: shippingInfo.district,
        shippingWard: shippingInfo.ward,
        note: shippingInfo.note,
        paymentMethod: paymentMethod,
        totalAmount: finalTotal,
        shippingFee: shippingFee,
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('https://localhost:7033/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Order result:', result);

        // Nếu VNPay → redirect sang cổng thanh toán VNPay
        if (paymentMethod === 'vnpay' && result.paymentUrl) {
          console.log('Redirecting to VNPay:', result.paymentUrl);
          clearCart();
          // Redirect trình duyệt sang VNPay
          window.location.href = result.paymentUrl;
          return; // Không show success screen, đợi VNPay callback
        }

        // COD / Bank / MoMo → show success screen bình thường
        setOrderId(result.orderCode || result.id || 'ORD' + Date.now());
        setOrderSuccess(true);
        clearCart();
      } else {
        const errorText = await response.text();
        console.error('Order failed:', errorText);
        alert('Đặt hàng thất bại: ' + errorText);
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect nếu giỏ hàng trống
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-500 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <Link to="/">
            <Button className="bg-red-600 hover:bg-red-700">Quay lại mua sắm</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h1>
            <p className="text-gray-500 mb-4">Cảm ơn bạn đã mua hàng tại GTG Shop</p>

            <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
              <p className="text-sm text-gray-500 mb-2">Mã đơn hàng của bạn</p>
              <p className="text-2xl font-bold text-red-600">{orderId}</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-orange-800 mb-2">📦 Thông tin giao hàng</h3>
              <p className="text-sm text-orange-700">
                Đơn hàng sẽ được giao đến: <strong>{shippingInfo.address}, {shippingInfo.ward}, {shippingInfo.district}, {shippingInfo.city}</strong>
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Dự kiến giao hàng: <strong>2-3 ngày làm việc</strong>
              </p>
            </div>

            <div className="flex gap-4">
              <Link to="/orders" className="flex-1">
                <Button variant="outline" className="w-full">Xem đơn hàng</Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
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
          <Link to="/cart" className="hover:text-red-600">Giỏ hàng</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Thanh toán</span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="ml-2 font-medium hidden sm:block">Giao hàng</span>
            </div>
            <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="ml-2 font-medium hidden sm:block">Thanh toán</span>
            </div>
            <div className={`w-16 h-1 mx-2 ${step >= 3 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>3</div>
              <span className="ml-2 font-medium hidden sm:block">Xác nhận</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Info */}
            {step === 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-red-600" />
                  Thông tin giao hàng
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        placeholder="Nguyễn Văn A"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        placeholder="0901 234 567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      placeholder="email@example.com"
                    />
                  </div>

                  {/* Tỉnh/Thành phố - 34 tỉnh thành */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quận */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="district"
                      value={shippingInfo.district}
                      onChange={handleShippingChange}
                      placeholder="Quận 1, Quận Bình Thạnh..."
                      required
                    />
                  </div>

                  {/* Phường */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="ward"
                      value={shippingInfo.ward}
                      onChange={handleShippingChange}
                      placeholder="Phường Bến Nghé, Phường 1..."
                      required
                    />
                  </div>

                  {/* Địa chỉ cụ thể */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        placeholder="Số nhà, tên đường..."
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                    <textarea
                      name="note"
                      value={shippingInfo.note}
                      onChange={handleShippingChange}
                      placeholder="Ghi chú cho shipper (không bắt buộc)"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-red-600" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-4">
                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💵</span>
                          <span className="font-semibold">Thanh toán khi nhận hàng (COD)</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Thanh toán bằng tiền mặt khi nhận được hàng</p>
                      </div>
                    </div>
                  </label>

                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏦</span>
                          <span className="font-semibold">Chuyển khoản ngân hàng</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Chuyển khoản qua tài khoản ngân hàng</p>
                      </div>
                    </div>
                  </label>

                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📱</span>
                          <span className="font-semibold">Ví MoMo</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Thanh toán qua ví điện tử MoMo</p>
                      </div>
                    </div>
                  </label>

                  <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💳</span>
                          <span className="font-semibold">VNPay</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Thanh toán qua VNPay (ATM, Visa, MasterCard)</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-red-600" />
                      Thông tin giao hàng
                    </h3>
                    <button onClick={() => setStep(1)} className="text-red-600 text-sm hover:underline">Chỉnh sửa</button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>{shippingInfo.fullName}</strong> | {shippingInfo.phone}</p>
                    <p>{shippingInfo.address}, {shippingInfo.ward}, {shippingInfo.district}, {shippingInfo.city}</p>
                    {shippingInfo.note && <p className="text-gray-500">Ghi chú: {shippingInfo.note}</p>}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-red-600" />
                      Phương thức thanh toán
                    </h3>
                    <button onClick={() => setStep(2)} className="text-red-600 text-sm hover:underline">Chỉnh sửa</button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {paymentMethod === 'cod' && '💵 Thanh toán khi nhận hàng (COD)'}
                    {paymentMethod === 'bank' && '🏦 Chuyển khoản ngân hàng'}
                    {paymentMethod === 'momo' && '📱 Ví MoMo'}
                    {paymentMethod === 'vnpay' && '💳 VNPay'}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <h3 className="font-bold text-gray-800 mb-4">📦 Sản phẩm ({totalItems})</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.productId} className="flex gap-3">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-red-600">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              ) : (
                <Link to="/cart">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Giỏ hàng
                  </Button>
                </Link>
              )}

              {step < 3 ? (
                <Button onClick={handleNextStep} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  Tiếp tục
                </Button>
              ) : (
                <Button onClick={handlePlaceOrder} disabled={isLoading} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-8">
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" />Đang xử lý...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5 mr-2" />Đặt hàng</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border"
                      />
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-sm text-red-600">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-orange-600">💡 Miễn phí vận chuyển cho đơn từ 2.000.000đ</p>
                )}
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-red-600">{formatPrice(finalTotal)}</span>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Bảo mật thanh toán</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Giao hàng toàn quốc</span>
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