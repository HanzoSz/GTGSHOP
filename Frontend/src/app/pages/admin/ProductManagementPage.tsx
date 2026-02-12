import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';

export function ProductManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    {
      id: 'SP001',
      name: 'Intel Core i7-13700K',
      category: 'CPU',
      price: 9990000,
      stock: 45,
      sold: 234,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1588732283387-96e6650e7fae?w=100&h=100&fit=crop',
    },
    {
      id: 'SP002',
      name: 'NVIDIA GeForce RTX 4070 Ti',
      category: 'VGA',
      price: 19990000,
      stock: 23,
      sold: 145,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1658673847785-08f1738116f8?w=100&h=100&fit=crop',
    },
    {
      id: 'SP003',
      name: 'Corsair Vengeance RGB 32GB',
      category: 'RAM',
      price: 2990000,
      stock: 87,
      sold: 456,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1672165407836-4c376e7d72c7?w=100&h=100&fit=crop',
    },
    {
      id: 'SP004',
      name: 'ASUS ROG STRIX Z790-E',
      category: 'Mainboard',
      price: 8990000,
      stock: 12,
      sold: 89,
      status: 'Sắp hết',
      image: 'https://images.unsplash.com/photo-1586920740099-f3ceb65bc51e?w=100&h=100&fit=crop',
    },
    {
      id: 'SP005',
      name: 'Samsung 990 PRO 2TB',
      category: 'SSD',
      price: 4990000,
      stock: 56,
      sold: 321,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1721333084639-0f64b0583875?w=100&h=100&fit=crop',
    },
    {
      id: 'SP006',
      name: 'NZXT H710i Mid Tower RGB',
      category: 'Case',
      price: 3990000,
      stock: 34,
      sold: 178,
      status: 'Còn hàng',
      image: 'https://images.unsplash.com/photo-1755182528946-1dad8a79f44d?w=100&h=100&fit=crop',
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý sản phẩm</h1>
          <p className="text-slate-500 mt-1">Quản lý toàn bộ sản phẩm trong cửa hàng</p>
        </div>
        <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
          <Plus className="w-5 h-5 mr-2" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên, mã sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>Tất cả danh mục</option>
            <option>CPU</option>
            <option>VGA</option>
            <option>RAM</option>
            <option>Mainboard</option>
            <option>SSD</option>
            <option>Case</option>
            <option>PSU</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            <option>Tất cả trạng thái</option>
            <option>Còn hàng</option>
            <option>Sắp hết</option>
            <option>Hết hàng</option>
          </select>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-4 font-semibold text-slate-700">Sản phẩm</th>
                <th className="text-left p-4 font-semibold text-slate-700">Danh mục</th>
                <th className="text-left p-4 font-semibold text-slate-700">Giá</th>
                <th className="text-left p-4 font-semibold text-slate-700">Tồn kho</th>
                <th className="text-left p-4 font-semibold text-slate-700">Đã bán</th>
                <th className="text-left p-4 font-semibold text-slate-700">Trạng thái</th>
                <th className="text-right p-4 font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">#{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">{product.stock}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    {product.sold}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      product.status === 'Còn hàng' ? 'bg-green-100 text-green-700' :
                      product.status === 'Sắp hết' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
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
            Hiển thị <span className="font-semibold">1-6</span> trong tổng số <span className="font-semibold">456</span> sản phẩm
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
