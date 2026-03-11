import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, Loader2, AlertTriangle, ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { IMAGE_BASE_URL } from '@/config';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  getAdminProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  type AdminProduct,
  type Category,
} from '@/services/api';

// Form mặc định
const emptyForm = {
  name: '',
  price: 0,
  stock: 0,
  description: '',
  categoryId: 1,
  imageUrl: '',
  discount: 0,
};

export function ProductManagementPage() {
  // State danh sách & loading
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // State bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // State dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  // Lấy danh mục khi mount
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Hàm fetch sản phẩm
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const result = await getAdminProducts({
      page: currentPage,
      pageSize,
      search: searchTerm || undefined,
      categoryId: selectedCategory ? Number(selectedCategory) : null,
      status: selectedStatus || undefined,
    });
    setProducts(result.items);
    setTotalPages(result.totalPages);
    setTotalItems(result.totalItems);
    setLoading(false);
  }, [currentPage, searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Helpers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || `Category ${categoryId}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Hết hàng', color: 'bg-red-100 text-red-700' };
    if (stock <= 10) return { label: 'Sắp hết', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Còn hàng', color: 'bg-green-100 text-green-700' };
  };

  // Tính thống kê
  const statsTotal = totalItems;
  const statsInStock = products.filter(p => p.stock > 10).length;
  const statsLowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const statsOutOfStock = products.filter(p => p.stock === 0).length;

  // ===== CRUD Handlers =====
  const handleCreate = async () => {
    if (!formData.name.trim()) { setFormError('Vui lòng nhập tên sản phẩm'); return; }
    if (formData.price <= 0) { setFormError('Giá phải lớn hơn 0'); return; }

    setActionLoading(true);
    setFormError('');
    const result = await createProduct(formData);
    setActionLoading(false);

    if (result.success) {
      setShowCreateDialog(false);
      setFormData(emptyForm);
      fetchProducts();
    } else {
      setFormError(result.message || 'Lỗi tạo sản phẩm');
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    if (!formData.name.trim()) { setFormError('Vui lòng nhập tên sản phẩm'); return; }
    if (formData.price <= 0) { setFormError('Giá phải lớn hơn 0'); return; }

    setActionLoading(true);
    setFormError('');
    const result = await updateProduct(selectedProduct.id, formData);
    setActionLoading(false);

    if (result.success) {
      setShowEditDialog(false);
      setSelectedProduct(null);
      setFormData(emptyForm);
      fetchProducts();
    } else {
      setFormError(result.message || 'Lỗi cập nhật sản phẩm');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setActionLoading(true);
    const result = await deleteProduct(selectedProduct.id);
    setActionLoading(false);

    if (result.success) {
      setShowDeleteDialog(false);
      setSelectedProduct(null);
      fetchProducts();
    } else {
      setFormError(result.message || 'Lỗi xóa sản phẩm');
    }
  };

  const openEditDialog = (product: AdminProduct) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      discount: product.discount,
    });
    setFormError('');
    setShowEditDialog(true);
  };

  const openDeleteDialog = (product: AdminProduct) => {
    setSelectedProduct(product);
    setFormError('');
    setShowDeleteDialog(true);
  };

  const openDetailDialog = (product: AdminProduct) => {
    setSelectedProduct(product);
    setShowDetailDialog(true);
  };

  const openCreateDialog = () => {
    setFormData(emptyForm);
    setFormError('');
    setShowCreateDialog(true);
  };

  // Pagination helpers
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // ===== FORM COMPONENT =====
  const renderProductForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
      {formError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {formError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Tên sản phẩm *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nhập tên sản phẩm..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Giá (VND) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Tồn kho</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Danh mục</Label>
          <select
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Giảm giá (%)</Label>
          <Input
            id="discount"
            type="number"
            min={0}
            max={100}
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Hình ảnh sản phẩm</Label>
        {/* Upload từ thiết bị */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                setFormError('Ảnh không được vượt quá 5MB');
                return;
              }
              setUploading(true);
              setFormError('');
              const result = await uploadProductImage(file);
              setUploading(false);
              if (result.success && result.imageUrl) {
                setFormData(prev => ({ ...prev, imageUrl: result.imageUrl! }));
              } else {
                setFormError(result.message || 'Lỗi upload ảnh');
              }
              e.target.value = '';
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
              <span className="text-sm text-slate-500">Đang upload...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-sm text-slate-500">Bấm để chọn ảnh từ thiết bị</span>
              <span className="text-xs text-slate-400">PNG, JPG, WEBP (tối đa 5MB)</span>
            </div>
          )}
        </div>

        {/* Hoặc nhập URL */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span>hoặc nhập URL</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="images/products/ten-anh.jpg"
          className="text-sm"
        />

        {/* Preview */}
        {formData.imageUrl && (
          <div className="mt-1 w-24 h-24 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 relative group">
            <img
              src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `${IMAGE_BASE_URL}/${formData.imageUrl}`}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, imageUrl: '' })}
              className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Nhập mô tả sản phẩm..."
          rows={3}
        />
      </div>

      <DialogFooter className="pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={() => {
            setShowCreateDialog(false);
            setShowEditDialog(false);
          }}
          disabled={actionLoading}
        >
          Hủy
        </Button>
        <Button
          onClick={onSubmit}
          disabled={actionLoading}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
        >
          {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý sản phẩm</h1>
          <p className="text-slate-500 mt-1">Quản lý toàn bộ sản phẩm trong cửa hàng</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{statsTotal}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Còn hàng</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{statsInStock}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Sắp hết</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{statsLowStock}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Hết hàng</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{statsOutOfStock}</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-red-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-red-600" />
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
              placeholder="Tìm kiếm sản phẩm theo tên, mã sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="instock">Còn hàng</option>
            <option value="low">Sắp hết</option>
            <option value="outofstock">Hết hàng</option>
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
                <th className="text-left p-4 font-semibold text-slate-700">Giảm giá</th>
                <th className="text-left p-4 font-semibold text-slate-700">Tồn kho</th>
                <th className="text-left p-4 font-semibold text-slate-700">Trạng thái</th>
                <th className="text-right p-4 font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                      <span className="text-slate-500">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-12 h-12 text-slate-300" />
                      <p className="text-slate-500 font-medium">Không tìm thấy sản phẩm nào</p>
                      <p className="text-slate-400 text-sm">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const status = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <ImageIcon className={`w-5 h-5 text-slate-400 ${product.imageUrl ? 'hidden' : ''}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[250px]">{product.name}</p>
                            <p className="text-sm text-slate-500">#{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {getCategoryName(product.categoryId)}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="p-4">
                        {product.discount > 0 ? (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                            -{product.discount}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">{product.stock}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => openDetailDialog(product)}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => openEditDialog(product)}
                            title="Sửa sản phẩm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(product)}
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Hiển thị{' '}
              <span className="font-semibold">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)}</span>
              {' '}trong tổng số <span className="font-semibold">{totalItems}</span> sản phẩm
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {getPageNumbers().map(page => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : ''}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========= DIALOG: THÊM SẢN PHẨM ========= */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>Điền thông tin sản phẩm bên dưới</DialogDescription>
          </DialogHeader>
          {renderProductForm(handleCreate, 'Thêm sản phẩm')}
        </DialogContent>
      </Dialog>

      {/* ========= DIALOG: SỬA SẢN PHẨM ========= */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Sửa sản phẩm</DialogTitle>
            <DialogDescription>Cập nhật thông tin sản phẩm #{selectedProduct?.id}</DialogDescription>
          </DialogHeader>
          {renderProductForm(handleUpdate, 'Lưu thay đổi')}
        </DialogContent>
      </Dialog>

      {/* ========= DIALOG: XÓA SẢN PHẨM ========= */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selectedProduct.name}</p>
                <p className="text-sm text-slate-500">#{selectedProduct.id} · {formatPrice(selectedProduct.price)}</p>
              </div>
            </div>
          )}
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {formError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={actionLoading}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xóa sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========= DIALOG: XEM CHI TIẾT ========= */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>Thông tin chi tiết sản phẩm #{selectedProduct?.id}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              {/* Ảnh sản phẩm */}
              <div className="w-full h-48 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                {selectedProduct.imageUrl ? (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                )}
              </div>

              {/* Thông tin */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <p className="text-slate-500">Tên sản phẩm</p>
                  <p className="font-semibold text-slate-900 text-base">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Giá</p>
                  <p className="font-semibold text-slate-900">{formatPrice(selectedProduct.price)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Giảm giá</p>
                  <p className="font-semibold text-slate-900">{selectedProduct.discount}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Danh mục</p>
                  <p className="font-semibold text-slate-900">{getCategoryName(selectedProduct.categoryId)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Tồn kho</p>
                  <p className="font-semibold text-slate-900">{selectedProduct.stock}</p>
                </div>
                <div>
                  <p className="text-slate-500">Đánh giá</p>
                  <p className="font-semibold text-slate-900">⭐ {selectedProduct.rating} ({selectedProduct.reviews} đánh giá)</p>
                </div>
                <div>
                  <p className="text-slate-500">Trạng thái</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStockStatus(selectedProduct.stock).color}`}>
                    {getStockStatus(selectedProduct.stock).label}
                  </span>
                </div>
                {selectedProduct.description && (
                  <div className="col-span-2">
                    <p className="text-slate-500">Mô tả</p>
                    <p className="text-slate-700 mt-1 whitespace-pre-wrap">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Đóng
            </Button>
            <Button
              onClick={() => {
                setShowDetailDialog(false);
                if (selectedProduct) openEditDialog(selectedProduct);
              }}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Edit className="w-4 h-4 mr-2" />
              Sửa sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
