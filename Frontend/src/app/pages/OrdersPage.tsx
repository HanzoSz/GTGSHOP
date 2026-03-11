import { API_URL, IMAGE_BASE_URL } from '@/config';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  ShoppingBag,
  Search,
  Filter
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

export interface Order {
  id: string;
  orderCode: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  totalAmount: number;
  totalItems: number;
  items: {
    productId: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shippingInfo: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  paymentMethod: string;
}

const statusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle,
  },
  shipping: {
    label: 'Đang giao hàng',
    color: 'bg-purple-100 text-purple-700',
    icon: Truck,
  },
  delivered: {
    label: 'Đã giao hàng',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

type FilterStatus = 'all' | Order['status'];


// Helper function để fix image URL
const getImageUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) {
    // Fix URL bị thiếu / sau port (https://localhost:7033images/... → ${IMAGE_BASE_URL}/images/...)
    // Dùng [^/\d] thay vì (?!\/) để tránh regex backtracking
    return imageUrl.replace(/(:\d+)([^/\d])/, '$1/$2');
  }
  return `${IMAGE_BASE_URL}/${imageUrl.replace(/^\/+/, '')}`;
};

export function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus, searchQuery]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Orders response status:', response.status);

      if (response.status === 401) {
        console.error('Token expired or invalid');
        // Có thể redirect về login
        // navigate('/login');
        setOrders([]);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Orders data:', data);

        // Map dữ liệu từ API sang format frontend
        const mappedOrders = data.map((order: any) => ({
          id: order.id?.toString() || order.Id?.toString(),
          orderCode: order.orderCode || order.OrderCode,
          createdAt: order.createdAt || order.CreatedAt,
          status: (order.status || order.Status || 'pending').toLowerCase(),
          totalAmount: order.totalAmount || order.TotalAmount || 0,
          totalItems: order.items?.length || order.Items?.length || order.orderItems?.length || order.OrderItems?.length || 0,
          items: (order.items || order.Items || order.orderItems || order.OrderItems || []).map((item: any) => ({
            productId: item.productId || item.ProductId,
            name: item.productName || item.ProductName || item.name || item.Name,
            image: getImageUrl(item.productImage || item.ProductImage || item.image || item.Image),
            price: item.price || item.Price || 0,
            quantity: item.quantity || item.Quantity || 1,
          })),
          shippingInfo: {
            fullName: order.shippingFullName || order.ShippingFullName || '',
            phone: order.shippingPhone || order.ShippingPhone || '',
            address: order.shippingAddress || order.ShippingAddress || '',
            city: order.shippingCity || order.ShippingCity || '',
            district: order.shippingDistrict || order.ShippingDistrict || '',
            ward: order.shippingWard || order.ShippingWard || '',
          },
          paymentMethod: order.paymentMethod || order.PaymentMethod || 'cod',
        }));

        setOrders(mappedOrders);
      } else {
        const errorText = await response.text();
        console.error('Failed to load orders:', response.status, errorText);
        setOrders([]);
      }
    } catch (error) {
      console.error('Load orders error:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let result = orders;

    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }

    if (searchQuery) {
      result = result.filter(order =>
        order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredOrders(result);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem đơn hàng của mình.</p>
          <Link to="/login">
            <Button className="bg-red-600 hover:bg-red-700">Đăng nhập</Button>
          </Link>
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
          <span className="text-gray-800 font-medium">Đơn hàng của tôi</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Package className="w-7 h-7 text-red-600" />
          Đơn hàng của tôi
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = orders.filter(o => o.status === status).length;
            const Icon = config.icon;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status as FilterStatus)}
                className={`p-4 rounded-xl border transition-all ${filterStatus === status
                  ? 'border-red-600 bg-red-50'
                  : 'bg-white hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${filterStatus === status ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-sm text-gray-500">{config.label}</p>
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không có đơn hàng nào</h2>
            <p className="text-gray-500 mb-6">
              {filterStatus !== 'all'
                ? 'Không tìm thấy đơn hàng với trạng thái này.'
                : 'Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!'}
            </p>
            <Link to="/">
              <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  {/* Order Header */}
                  <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-800">#{order.orderCode}</span>
                      <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                            <p className="text-sm text-gray-500">x{item.quantity}</p>
                          </div>
                          <p className="font-semibold text-red-600">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          và {order.items.length - 2} sản phẩm khác...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-sm text-gray-500">Tổng tiền: </span>
                      <span className="text-lg font-bold text-red-600">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                        Xem chi tiết
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}