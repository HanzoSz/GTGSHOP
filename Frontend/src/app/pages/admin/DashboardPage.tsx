import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, DollarSign, Loader2, RefreshCw, TrendingUp, TrendingDown, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  getAdminDashboard,
  type DashboardData,
} from '@/services/api';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    const result = await getAdminDashboard();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('vi-VN').format(num);

  // Tính % thay đổi
  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const isIncrease = (current: number, previous: number) => current >= previous;

  // Relative time
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        <span className="ml-4 text-lg text-slate-500">Đang tải Dashboard...</span>
      </div>
    );
  }

  if (!data) return null;
  const { stats, recentOrders, topProducts, ordersByStatus } = data;

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: formatPrice(stats.totalRevenue),
      change: getChange(stats.revenueThisMonth, stats.revenueLastMonth),
      isUp: isIncrease(stats.revenueThisMonth, stats.revenueLastMonth),
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
      sub: `Tháng này: ${formatPrice(stats.revenueThisMonth)}`,
    },
    {
      title: 'Đơn hàng',
      value: formatNumber(stats.totalOrders),
      change: getChange(stats.ordersThisMonth, stats.ordersLastMonth),
      isUp: isIncrease(stats.ordersThisMonth, stats.ordersLastMonth),
      icon: ShoppingCart,
      color: 'from-blue-600 to-blue-700',
      sub: `Tháng này: ${stats.ordersThisMonth}`,
    },
    {
      title: 'Sản phẩm',
      value: formatNumber(stats.totalProducts),
      change: '',
      isUp: true,
      icon: Package,
      color: 'from-purple-600 to-purple-700',
      sub: 'Đang kinh doanh',
    },
    {
      title: 'Khách hàng',
      value: formatNumber(stats.totalCustomers),
      change: getChange(stats.customersThisMonth, stats.customersLastMonth),
      isUp: isIncrease(stats.customersThisMonth, stats.customersLastMonth),
      icon: Users,
      color: 'from-orange-600 to-orange-700',
      sub: `Mới tháng này: +${stats.customersThisMonth}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
        </div>
        <Button onClick={fetchDashboard} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span className={`text-sm font-semibold flex items-center gap-1 ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-2">{stat.sub}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 p-6 border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Đơn hàng mới nhất</h2>
            <a href="/admin/orders" className="text-sm text-red-600 hover:underline font-medium">
              Xem tất cả →
            </a>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const sc = statusConfig[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">#{order.orderCode}</span>
                        <span className="text-slate-600">{order.shippingFullName}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{getRelativeTime(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatPrice(order.totalAmount)}</p>
                      <span className={`inline-block text-xs px-3 py-1 rounded-full mt-1 font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6 border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sản phẩm bán chạy</h2>
          {topProducts.length === 0 ? (
            <div className="text-center py-10">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                    index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{product.productName}</p>
                    <p className="text-xs text-slate-500">Đã bán: {product.totalSold}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 whitespace-nowrap">{formatPrice(product.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Order Status Breakdown */}
      {ordersByStatus.length > 0 && (
        <Card className="p-6 border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Phân bổ trạng thái đơn hàng</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const found = ordersByStatus.find(o => o.status === key);
              const count = found?.count || 0;
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                    <p className="text-xs text-slate-500">{config.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
