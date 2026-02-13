import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Mail, Phone, MapPin, Users, UserCheck, UserPlus, ShoppingBag, Loader2, ChevronLeft, ChevronRight, RefreshCw, Package, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  getAdminUsers,
  getAdminUserDetail,
  getAdminUserStats,
  type AdminUser,
  type AdminUserDetail,
  type AdminUserStats,
} from '@/services/api';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export function CustomerManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Stats
  const [stats, setStats] = useState<AdminUserStats>({
    totalUsers: 0,
    totalAdmins: 0,
    newUsersThisMonth: 0,
    usersWithOrders: 0,
  });

  // Detail dialog
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const result = await getAdminUsers({
      page: currentPage,
      pageSize,
      search: searchTerm || undefined,
    });
    setUsers(result.items);
    setTotalItems(result.totalItems);
    setTotalPages(result.totalPages);
    setLoading(false);
  }, [currentPage, searchTerm]);

  const fetchStats = useCallback(async () => {
    const s = await getAdminUserStats();
    setStats(s);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Xếp hạng khách hàng theo tổng chi tiêu
  const getCustomerTier = (totalSpent: number, orderCount: number) => {
    if (totalSpent >= 50000000 || orderCount >= 10)
      return { label: 'VIP', color: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' };
    if (totalSpent >= 20000000 || orderCount >= 5)
      return { label: 'Thân thiết', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Thường', color: 'bg-slate-100 text-slate-700' };
  };

  // Mở dialog chi tiết
  const openDetail = async (user: AdminUser) => {
    setShowDetailDialog(true);
    setDetailLoading(true);
    const detail = await getAdminUserDetail(user.id);
    if (detail) {
      setSelectedUser(detail);
    } else {
      // Fallback: dùng data hiện có
      setSelectedUser({ ...user, recentOrders: [] });
    }
    setDetailLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý khách hàng</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin và lịch sử mua hàng của khách hàng</p>
        </div>
        <Button onClick={() => { fetchUsers(); fetchStats(); }} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalUsers.toLocaleString('vi-VN')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Có đơn hàng</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.usersWithOrders.toLocaleString('vi-VN')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Khách mới (tháng)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.newUsersThisMonth.toLocaleString('vi-VN')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Quản trị viên</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalAdmins.toLocaleString('vi-VN')}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="ml-3 text-slate-500">Đang tải danh sách khách hàng...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Không có khách hàng nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-700">Khách hàng</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Liên hệ</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Đơn hàng</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Tổng chi tiêu</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Đơn gần nhất</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Hạng</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Ngày tạo</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const tier = getCustomerTier(user.totalSpent, user.orderCount);
                    return (
                      <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{user.fullName}</p>
                              <p className="text-xs text-slate-400">#{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{user.email}</span>
                            </div>
                            {user.phoneNumber && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{user.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                            {user.orderCount}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-900">
                          {formatPrice(user.totalSpent)}
                        </td>
                        <td className="p-4 text-slate-600 text-sm">
                          {user.lastOrderDate ? formatDate(user.lastOrderDate) : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${tier.color}`}>
                            {tier.label}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => openDetail(user)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
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
                Hiển thị <span className="font-semibold">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)}</span> trong tổng số <span className="font-semibold">{totalItems}</span> khách hàng
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

      {/* ========= DIALOG CHI TIẾT KHÁCH HÀNG ========= */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-600" />
              Chi tiết khách hàng
            </DialogTitle>
            <DialogDescription>
              Thông tin và lịch sử mua hàng
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              <span className="ml-3 text-slate-500">Đang tải...</span>
            </div>
          ) : selectedUser && (
            <div className="space-y-4">
              {/* Thông tin cá nhân */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedUser.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${getCustomerTier(selectedUser.totalSpent, selectedUser.orderCount).color}`}>
                        {getCustomerTier(selectedUser.totalSpent, selectedUser.orderCount).label}
                      </span>
                      <span className="text-sm text-slate-500">• {selectedUser.roleName}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.phoneNumber && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{selectedUser.phoneNumber}</span>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="flex items-center gap-2 text-slate-600 col-span-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{selectedUser.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Ngày tham gia: {formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Thống kê mua hàng */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Package className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{selectedUser.orderCount}</p>
                  <p className="text-xs text-blue-500">Đơn hàng</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <ShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-700">{formatPrice(selectedUser.totalSpent)}</p>
                  <p className="text-xs text-green-500">Tổng chi tiêu</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm font-bold text-purple-700">
                    {selectedUser.lastOrderDate ? formatDate(selectedUser.lastOrderDate) : '—'}
                  </p>
                  <p className="text-xs text-purple-500">Đơn gần nhất</p>
                </div>
              </div>

              {/* Đơn hàng gần đây */}
              {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Đơn hàng gần đây
                  </h3>
                  {selectedUser.recentOrders.map((order) => {
                    const sc = statusConfig[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-700' };
                    return (
                      <div key={order.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800">#{order.orderCode}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDateTime(order.createdAt)} • {order.itemCount} sản phẩm
                          </p>
                        </div>
                        <p className="font-semibold text-red-600">{formatPrice(order.totalAmount)}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedUser.recentOrders && selectedUser.recentOrders.length === 0 && (
                <div className="bg-slate-50 rounded-lg p-6 text-center">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Chưa có đơn hàng nào</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}