import { useState } from 'react';
import { Search, Eye, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';

export function OrderManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const orders = [
    {
      id: 'DH001',
      customer: 'Nguyễn Văn A',
      phone: '0901234567',
      total: 15990000,
      items: 3,
      status: 'Đang xử lý',
      payment: 'COD',
      date: '01/02/2025 10:30',
    },
    {
      id: 'DH002',
      customer: 'Trần Thị B',
      phone: '0912345678',
      total: 25490000,
      items: 5,
      status: 'Hoàn thành',
      payment: 'Chuyển khoản',
      date: '01/02/2025 09:15',
    },
    {
      id: 'DH003',
      customer: 'Lê Văn C',
      phone: '0923456789',
      total: 9990000,
      items: 2,
      status: 'Đang giao',
      payment: 'COD',
      date: '01/02/2025 08:45',
    },
    {
      id: 'DH004',
      customer: 'Phạm Thị D',
      phone: '0934567890',
      total: 32000000,
      items: 4,
      status: 'Đang xử lý',
      payment: 'Chuyển khoản',
      date: '31/01/2025 16:20',
    },
    {
      id: 'DH005',
      customer: 'Hoàng Văn E',
      phone: '0945678901',
      total: 18500000,
      items: 6,
      status: 'Hoàn thành',
      payment: 'Chuyển khoản',
      date: '31/01/2025 14:30',
    },
    {
      id: 'DH006',
      customer: 'Vũ Thị F',
      phone: '0956789012',
      total: 7990000,
      items: 1,
      status: 'Đã hủy',
      payment: 'COD',
      date: '31/01/2025 11:00',
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-green-100 text-green-700';
      case 'Đang giao':
        return 'bg-blue-100 text-blue-700';
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-700';
      case 'Đã hủy':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý đơn hàng</h1>
          <p className="text-slate-500 mt-1">Theo dõi và xử lý đơn hàng từ khách hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Tùy chỉnh</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Đang xử lý</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">24</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Đang giao</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">18</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600 mt-1">156</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Đã hủy</p>
              <p className="text-2xl font-bold text-red-600 mt-1">12</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm đơn hàng theo mã, tên khách hàng, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>Tất cả trạng thái</option>
            <option>Đang xử lý</option>
            <option>Đang giao</option>
            <option>Hoàn thành</option>
            <option>Đã hủy</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>Tất cả phương thức</option>
            <option>COD</option>
            <option>Chuyển khoản</option>
            <option>Ví điện tử</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-4 font-semibold text-slate-700">Mã đơn</th>
                <th className="text-left p-4 font-semibold text-slate-700">Khách hàng</th>
                <th className="text-left p-4 font-semibold text-slate-700">Tổng tiền</th>
                <th className="text-left p-4 font-semibold text-slate-700">Số lượng</th>
                <th className="text-left p-4 font-semibold text-slate-700">Thanh toán</th>
                <th className="text-left p-4 font-semibold text-slate-700">Trạng thái</th>
                <th className="text-left p-4 font-semibold text-slate-700">Thời gian</th>
                <th className="text-right p-4 font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">#{order.id}</p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{order.customer}</p>
                      <p className="text-sm text-slate-500">{order.phone}</p>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="p-4 text-slate-600">
                    {order.items} sản phẩm
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {order.payment}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    {order.date}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-600">
            Hiển thị <span className="font-semibold">1-6</span> trong tổng số <span className="font-semibold">210</span> đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Trước</Button>
            <Button variant="outline" size="sm" className="bg-red-600 text-white border-red-600">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Sau</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
