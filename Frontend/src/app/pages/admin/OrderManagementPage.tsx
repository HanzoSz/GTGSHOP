import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Truck, CheckCircle, XCircle, Clock, Loader2, Package, MapPin, Phone, User, CreditCard, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  getAdminOrders,
  updateOrderStatus,
  type AdminOrder,
} from '@/services/api';

import { IMAGE_BASE_URL } from '@/config';

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${IMAGE_BASE_URL}/${url.replace(/^\/+/, '')}`;
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
};

// Trạng thái hợp lệ khi chuyển
const nextStatusMap: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function OrderManagementPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const result = await getAdminOrders({
      page: currentPage,
      pageSize,
      search: searchTerm || undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
    });
    setOrders(result.items);
    setTotalItems(result.totalItems);
    setTotalPages(result.totalPages);
    setLoading(false);
  }, [currentPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'cod': return 'COD';
      case 'bank': return 'Chuyển khoản';
      case 'momo': return 'MoMo';
      case 'vnpay': return 'VNPay';
      default: return method;
    }
  };

  // Đếm số đơn theo trạng thái
  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  // Mở dialog chi tiết
  const openDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowDetailDialog(true);
  };

  // Mở dialog cập nhật trạng thái
  const openStatusUpdate = (order: AdminOrder) => {
    setSelectedOrder(order);
    const available = nextStatusMap[order.status] || [];
    setNewStatus(available[0] || '');
    setShowStatusDialog(true);
  };

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    const result = await updateOrderStatus(selectedOrder.id, newStatus);
    setUpdating(false);

    if (result.success) {
      setShowStatusDialog(false);
      fetchOrders(); // Reload
    } else {
      alert(result.message || 'Lỗi cập nhật trạng thái');
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
        <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = statusCounts[key as keyof typeof statusCounts] || 0;
          return (
            <Card
              key={key}
              className={`p-4 border-slate-200 cursor-pointer transition-all hover:shadow-md ${filterStatus === key ? 'ring-2 ring-red-500 bg-red-50' : ''
                }`}
              onClick={() => {
                setFilterStatus(filterStatus === key ? 'all' : key);
                setCurrentPage(1);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs">{config.label}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
                <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao</option>
            <option value="delivered">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="ml-3 text-slate-500">Đang tải đơn hàng...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Không có đơn hàng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-700">Mã đơn</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Khách hàng</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Tổng tiền</th>
                    <th className="text-left p-4 font-semibold text-slate-700">SP</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Thanh toán</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Trạng thái</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Thời gian</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const canUpdate = (nextStatusMap[order.status] || []).length > 0;
                    return (
                      <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">#{order.orderCode}</p>
                          <p className="text-xs text-slate-400">ID: {order.id}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">{order.shippingFullName}</p>
                          <p className="text-sm text-slate-500">{order.shippingPhone}</p>
                        </td>
                        <td className="p-4 font-semibold text-slate-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="p-4 text-slate-600">
                          {order.items.length} SP
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                            {getPaymentLabel(order.paymentMethod)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => openDetail(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
                            {canUpdate && (
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => openStatusUpdate(order)}
                              >
                                Cập nhật
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Hiển thị <span className="font-semibold">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số <span className="font-semibold">{totalItems}</span> đơn hàng
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    className={currentPage === page ? 'bg-red-600 text-white border-red-600' : ''}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ========= DIALOG CHI TIẾT ĐƠN HÀNG ========= */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              Chi tiết đơn hàng #{selectedOrder?.orderCode}
            </DialogTitle>
            <DialogDescription>
              Đặt lúc: {selectedOrder ? formatDate(selectedOrder.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Trạng thái */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Trạng thái:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${(statusConfig[selectedOrder.status] || statusConfig.pending).color}`}>
                  {(statusConfig[selectedOrder.status] || statusConfig.pending).label}
                </span>
              </div>

              {/* Thông tin khách */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Họ tên:</span>{' '}
                    <span className="font-medium">{selectedOrder.shippingFullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">SĐT:</span>{' '}
                    <span className="font-medium">{selectedOrder.shippingPhone}</span>
                  </div>
                  {selectedOrder.shippingEmail && (
                    <div className="col-span-2">
                      <span className="text-slate-500">Email:</span>{' '}
                      <span className="font-medium">{selectedOrder.shippingEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ giao hàng
                </h3>
                <p className="text-sm">
                  {selectedOrder.shippingAddress}
                  {selectedOrder.shippingWard && `, ${selectedOrder.shippingWard}`}
                  {selectedOrder.shippingDistrict && `, ${selectedOrder.shippingDistrict}`}
                  {selectedOrder.shippingCity && `, ${selectedOrder.shippingCity}`}
                </p>
              </div>

              {/* Sản phẩm */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-slate-800">Sản phẩm ({selectedOrder.items.length})</h3>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    <img
                      src={item.productImage ? getImageUrl(item.productImage) : 'https://via.placeholder.com/56x56?text=SP'}
                      alt={item.productName || `Sản phẩm #${item.productId}`}
                      className="w-14 h-14 object-cover rounded-lg border flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56x56?text=SP'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 line-clamp-2">
                        {item.productName || `Sản phẩm #${item.productId}`}
                      </p>
                      <p className="text-sm text-slate-500">SL: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-semibold text-red-600 whitespace-nowrap">{formatPrice(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>

              {/* Thanh toán */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Thanh toán
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phương thức:</span>
                  <span className="font-medium">{getPaymentLabel(selectedOrder.paymentMethod)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phí giao hàng:</span>
                  <span className="font-medium">{selectedOrder.shippingFee > 0 ? formatPrice(selectedOrder.shippingFee) : 'Miễn phí'}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-slate-800">Tổng cộng:</span>
                  <span className="font-bold text-red-600 text-lg">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Ghi chú */}
              {selectedOrder.note && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm"><span className="font-semibold">Ghi chú:</span> {selectedOrder.note}</p>
                </div>
              )}
              {selectedOrder.cancelReason && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm"><span className="font-semibold text-red-700">Lý do hủy:</span> {selectedOrder.cancelReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========= DIALOG CẬP NHẬT TRẠNG THÁI ========= */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Đơn hàng #{selectedOrder?.orderCode}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Trạng thái hiện tại */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Hiện tại:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${(statusConfig[selectedOrder.status] || statusConfig.pending).color}`}>
                  {(statusConfig[selectedOrder.status] || statusConfig.pending).label}
                </span>
              </div>

              {/* Chọn trạng thái mới */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chuyển sang:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {(nextStatusMap[selectedOrder.status] || []).map(s => (
                    <option key={s} value={s}>
                      {statusConfig[s]?.label || s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mô tả flow */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">
                  Luồng xử lý: Chờ xác nhận → Đã xác nhận → Đang giao → Hoàn thành
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} disabled={updating}>
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating || !newStatus}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Xác nhận cập nhật'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
