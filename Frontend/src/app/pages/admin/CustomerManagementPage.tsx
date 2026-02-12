import { useState } from 'react';
import { Search, Eye, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';

export function CustomerManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    {
      id: 'KH001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      phone: '0901234567',
      address: 'Hà Nội',
      orders: 12,
      totalSpent: 45000000,
      lastOrder: '01/02/2025',
      status: 'VIP',
    },
    {
      id: 'KH002',
      name: 'Trần Thị B',
      email: 'tranthib@gmail.com',
      phone: '0912345678',
      address: 'Hồ Chí Minh',
      orders: 8,
      totalSpent: 28500000,
      lastOrder: '31/01/2025',
      status: 'Thân thiết',
    },
    {
      id: 'KH003',
      name: 'Lê Văn C',
      email: 'levanc@gmail.com',
      phone: '0923456789',
      address: 'Đà Nẵng',
      orders: 5,
      totalSpent: 15000000,
      lastOrder: '30/01/2025',
      status: 'Thường',
    },
    {
      id: 'KH004',
      name: 'Phạm Thị D',
      email: 'phamthid@gmail.com',
      phone: '0934567890',
      address: 'Hải Phòng',
      orders: 15,
      totalSpent: 68000000,
      lastOrder: '29/01/2025',
      status: 'VIP',
    },
    {
      id: 'KH005',
      name: 'Hoàng Văn E',
      email: 'hoangvane@gmail.com',
      phone: '0945678901',
      address: 'Cần Thơ',
      orders: 3,
      totalSpent: 8500000,
      lastOrder: '28/01/2025',
      status: 'Thường',
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VIP':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 'Thân thiết':
        return 'bg-blue-100 text-blue-700';
      case 'Thường':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý khách hàng</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin và lịch sử mua hàng của khách hàng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-slate-200">
          <div>
            <p className="text-slate-500 text-sm">Tổng khách hàng</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">2,845</p>
            <p className="text-sm text-green-600 mt-2">+15.3% so với tháng trước</p>
          </div>
        </Card>
        <Card className="p-6 border-slate-200 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
          <div>
            <p className="text-yellow-100 text-sm">Khách VIP</p>
            <p className="text-2xl font-bold mt-1">234</p>
            <p className="text-sm text-yellow-100 mt-2">Top 10% doanh thu</p>
          </div>
        </Card>
        <Card className="p-6 border-slate-200">
          <div>
            <p className="text-slate-500 text-sm">Khách thân thiết</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">567</p>
            <p className="text-sm text-blue-600 mt-2">Mua {'>='} 5 đơn</p>
          </div>
        </Card>
        <Card className="p-6 border-slate-200">
          <div>
            <p className="text-slate-500 text-sm">Khách mới (tháng này)</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">89</p>
            <p className="text-sm text-green-600 mt-2">+12 so với tuần trước</p>
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
              placeholder="Tìm kiếm khách hàng theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>Tất cả hạng</option>
            <option>VIP</option>
            <option>Thân thiết</option>
            <option>Thường</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>Tất cả khu vực</option>
            <option>Hà Nội</option>
            <option>Hồ Chí Minh</option>
            <option>Đà Nẵng</option>
          </select>
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-4 font-semibold text-slate-700">Khách hàng</th>
                <th className="text-left p-4 font-semibold text-slate-700">Liên hệ</th>
                <th className="text-left p-4 font-semibold text-slate-700">Địa chỉ</th>
                <th className="text-left p-4 font-semibold text-slate-700">Đơn hàng</th>
                <th className="text-left p-4 font-semibold text-slate-700">Tổng chi tiêu</th>
                <th className="text-left p-4 font-semibold text-slate-700">Đơn gần nhất</th>
                <th className="text-left p-4 font-semibold text-slate-700">Hạng</th>
                <th className="text-right p-4 font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{customer.name}</p>
                        <p className="text-sm text-slate-500">#{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{customer.address}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                      {customer.orders}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {formatPrice(customer.totalSpent)}
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    {customer.lastOrder}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
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
            Hiển thị <span className="font-semibold">1-5</span> trong tổng số <span className="font-semibold">2,845</span> khách hàng
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