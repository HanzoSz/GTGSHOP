import { TrendingUp, Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

export function DashboardPage() {
  const stats = [
    {
      title: 'Tổng doanh thu',
      value: '₫1,245,000,000',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
    },
    {
      title: 'Đơn hàng',
      value: '1,234',
      change: '+8.2%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'from-blue-600 to-blue-700',
    },
    {
      title: 'Sản phẩm',
      value: '456',
      change: '+3',
      changeType: 'increase',
      icon: Package,
      color: 'from-purple-600 to-purple-700',
    },
    {
      title: 'Khách hàng',
      value: '2,845',
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
      color: 'from-orange-600 to-orange-700',
    },
  ];

  const recentOrders = [
    { id: 'DH001', customer: 'Nguyễn Văn A', amount: '15,990,000', status: 'Đang xử lý', time: '5 phút trước' },
    { id: 'DH002', customer: 'Trần Thị B', amount: '25,490,000', status: 'Hoàn thành', time: '15 phút trước' },
    { id: 'DH003', customer: 'Lê Văn C', amount: '9,990,000', status: 'Đang giao', time: '30 phút trước' },
    { id: 'DH004', customer: 'Phạm Thị D', amount: '32,000,000', status: 'Đang xử lý', time: '1 giờ trước' },
    { id: 'DH005', customer: 'Hoàng Văn E', amount: '18,500,000', status: 'Hoàn thành', time: '2 giờ trước' },
  ];

  const topProducts = [
    { name: 'RTX 4070 Ti', sold: 145, revenue: '₫2,898,550,000' },
    { name: 'Intel Core i7-13700K', sold: 234, revenue: '₫2,337,660,000' },
    { name: 'Corsair Vengeance RGB 32GB', sold: 456, revenue: '₫1,363,440,000' },
    { name: 'Samsung 990 PRO 2TB', sold: 321, revenue: '₫1,601,790,000' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>90 ngày qua</option>
            <option>1 năm qua</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
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
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">#{order.id}</span>
                    <span className="text-slate-600">{order.customer}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{order.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">₫{order.amount}</p>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full mt-1 ${
                    order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                    order.status === 'Đang giao' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6 border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                  index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500 text-white' :
                  index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                  <p className="text-xs text-slate-500">Đã bán: {product.sold}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{product.revenue}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tet Banner */}
      <Card className="p-6 bg-gradient-to-r from-red-600 to-orange-600 border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">🎊 SALE TẾT 2026 - GIẢM ĐẾN 50% 🎊</h3>
            <p className="text-yellow-100">Chuẩn bị sẵn hàng cho mùa Tết sắp tới!</p>
          </div>
          <button className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-yellow-400 hover:text-red-900 transition-colors">
            Xem thống kê
          </button>
        </div>
      </Card>
    </div>
  );
}
