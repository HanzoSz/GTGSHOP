import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Phone,
  User,
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Order } from './OrdersPage';

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'text-yellow-600', bgColor: 'bg-yellow-600', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'text-blue-600', bgColor: 'bg-blue-600', icon: CheckCircle },
  shipping: { label: 'Đang giao hàng', color: 'text-purple-600', bgColor: 'bg-purple-600', icon: Truck },
  delivered: { label: 'Đã giao hàng', color: 'text-green-600', bgColor: 'bg-green-600', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'text-red-600', bgColor: 'bg-red-600', icon: XCircle },
};

const statusSteps = ['pending', 'confirmed', 'shipping', 'delivered'];

const IMAGE_BASE_URL = 'https://localhost:7033';

const getImageUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return '/placeholder.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${IMAGE_BASE_URL}/${imageUrl.replace(/^\/+/, '')}`;
};

const fetchProductInfo = async (productId: number) => {
  try {
    const response = await fetch(`https://localhost:7033/api/products/${productId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Fetch product error:', error);
  }
  return null;
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7033/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Order detail raw:', data);
        
        const orderItems = data.items || data.Items || data.orderItems || data.OrderItems || [];
        
        const itemsWithProductInfo = await Promise.all(orderItems.map(async (item: any) => {
          const productId = item.productId || item.ProductId;
          let productName = item.productName || item.ProductName;
          let productImage = item.productImage || item.ProductImage;
          
          if (!productName || !productImage) {
            const product = await fetchProductInfo(productId);
            if (product) {
              productName = productName || product.name || product.Name;
              productImage = productImage || product.imageUrl || product.ImageUrl;
            }
          }
          
          return {
            productId,
            name: productName || `Sản phẩm #${productId}`,
            image: getImageUrl(productImage),
            price: item.price || item.Price || 0,
            quantity: item.quantity || item.Quantity || 1,
          };
        }));

        const mappedOrder: Order = {
          id: (data.id || data.Id)?.toString(),
          orderCode: data.orderCode || data.OrderCode,
          createdAt: data.createdAt || data.CreatedAt,
          status: (data.status || data.Status || 'pending').toLowerCase() as Order['status'],
          totalAmount: data.totalAmount || data.TotalAmount || 0,
          totalItems: itemsWithProductInfo.length,
          items: itemsWithProductInfo,
          shippingInfo: {
            fullName: data.shippingFullName || data.ShippingFullName || '',
            phone: data.shippingPhone || data.ShippingPhone || '',
            address: data.shippingAddress || data.ShippingAddress || '',
            city: data.shippingCity || data.ShippingCity || '',
            district: data.shippingDistrict || data.ShippingDistrict || '',
            ward: data.shippingWard || data.ShippingWard || '',
          },
          paymentMethod: data.paymentMethod || data.PaymentMethod || 'cod',
        };
        
        setOrder(mappedOrder);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error('Load order error:', error);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    setIsCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7033/api/orders/${order.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (response.ok) {
        alert('Đơn hàng đã được hủy thành công!');
        setShowCancelModal(false);
        // Reload order để cập nhật trạng thái
        loadOrder();
      } else {
        const error = await response.text();
        alert('Không thể hủy đơn hàng: ' + error);
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Có lỗi xảy ra khi hủy đơn hàng.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyOrderCode = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cod': return '💵 Thanh toán khi nhận hàng (COD)';
      case 'bank': return '🏦 Chuyển khoản ngân hàng';
      case 'momo': return '📱 Ví MoMo';
      case 'vnpay': return '💳 VNPay';
      default: return method;
    }
  };

  const getCurrentStepIndex = (status: Order['status']) => {
    if (status === 'cancelled') return -1;
    return statusSteps.indexOf(status);
  };

  // Kiểm tra có thể hủy đơn không
  const canCancelOrder = order && (order.status === 'pending' || order.status === 'confirmed');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin đơn hàng...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
          <Link to="/orders">
            <Button className="bg-red-600 hover:bg-red-700">Quay lại danh sách</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const currentStep = getCurrentStepIndex(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          <span>/</span>
          <Link to="/orders" className="hover:text-red-600">Đơn hàng của tôi</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{order.orderCode}</span>
        </div>

        {/* Back Button */}
        <Link to="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách đơn hàng
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-gray-800">Đơn hàng #{order.orderCode}</h1>
                <button
                  onClick={copyOrderCode}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy mã đơn hàng"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              <p className="text-sm text-gray-500">Đặt lúc: {formatDate(order.createdAt)}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${status.color} bg-opacity-10`} style={{ backgroundColor: `${status.bgColor}15` }}>
              <StatusIcon className="w-5 h-5" />
              {status.label}
            </div>
          </div>

          {/* Order Progress */}
          {order.status !== 'cancelled' && (
            <div className="relative">
              <div className="flex justify-between mb-2">
                {statusSteps.map((step, index) => {
                  const stepConfig = statusConfig[step as keyof typeof statusConfig];
                  const StepIcon = stepConfig.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs mt-2 text-center ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        {stepConfig.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {order.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-red-700 font-medium">Đơn hàng đã bị hủy</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-red-600" />
                Sản phẩm đã đặt ({order.totalItems})
              </h2>

              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <Link to={`/product/${item.productId}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border hover:border-red-600 transition-colors"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.productId}`} className="hover:text-red-600">
                        <h3 className="font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                      <p className="text-red-600 font-semibold mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-600" />
                Thông tin giao hàng
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Người nhận</p>
                    <p className="font-medium text-gray-800">{order.shippingInfo.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-800">{order.shippingInfo.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium text-gray-800">
                      {order.shippingInfo.address}, {order.shippingInfo.ward}, {order.shippingInfo.district}, {order.shippingInfo.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                Thanh toán
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phương thức</span>
                  <span className="font-medium">{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tạm tính</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">Tổng cộng</span>
                    <span className="font-bold text-red-600 text-lg">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border space-y-3">
              {order.status === 'delivered' && (
                <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  Mua lại
                </Button>
              )}
              {canCancelOrder && (
                <Button 
                  variant="outline" 
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  Hủy đơn hàng
                </Button>
              )}
              <Link to="/" className="block">
                <Button variant="outline" className="w-full">
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Hủy đơn hàng</h3>
                <p className="text-sm text-gray-500">#{order.orderCode}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy (không bắt buộc)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy đơn hàng..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Không, giữ đơn
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}