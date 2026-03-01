import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Pencil, Trash2, X, Package, Search } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from '../../../services/api';

export function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Delete confirmation
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    // Auto-hide success message
    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    const loadCategories = async () => {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setCategoryName('');
        setError('');
        setShowModal(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setCategoryName(cat.name);
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!categoryName.trim()) {
            setError('Tên danh mục không được để trống');
            return;
        }

        setSaving(true);
        setError('');

        if (editingCategory) {
            const result = await updateCategory(editingCategory.id, categoryName.trim());
            if (result.success) {
                setSuccessMsg('Cập nhật danh mục thành công!');
                setShowModal(false);
                loadCategories();
            } else {
                setError(result.message || 'Lỗi cập nhật');
            }
        } else {
            const result = await createCategory(categoryName.trim());
            if (result.success) {
                setSuccessMsg('Tạo danh mục thành công!');
                setShowModal(false);
                loadCategories();
            } else {
                setError(result.message || 'Lỗi tạo danh mục');
            }
        }

        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        const result = await deleteCategory(id);
        if (result.success) {
            setSuccessMsg('Xoá danh mục thành công!');
            setDeletingId(null);
            loadCategories();
        } else {
            setError(result.message || 'Lỗi xoá danh mục');
            setDeletingId(null);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
                            <FolderOpen className="w-6 h-6 text-white" />
                        </div>
                        Quản lý danh mục
                    </h1>
                    <p className="text-slate-500 mt-1">Quản lý các danh mục sản phẩm của shop</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Thêm danh mục
                </button>
            </div>

            {/* Success Message */}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    ✅ {successMsg}
                </div>
            )}

            {/* Error Message */}
            {error && !showModal && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    ❌ {error}
                    <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Search */}
            <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Tổng danh mục</p>
                    <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Có sản phẩm</p>
                    <p className="text-2xl font-bold text-green-600">{categories.filter(c => (c.productCount || 0) > 0).length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Danh mục trống</p>
                    <p className="text-2xl font-bold text-orange-500">{categories.filter(c => (c.productCount || 0) === 0).length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">ID</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Tên danh mục</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Số sản phẩm</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-12 text-slate-400">
                                    <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    Đang tải...
                                </td>
                            </tr>
                        ) : filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-12 text-slate-400">
                                    <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    Không tìm thấy danh mục nào
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map((cat) => (
                                <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono text-slate-500">#{cat.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                                                <FolderOpen className="w-4 h-4 text-red-600" />
                                            </div>
                                            <span className="font-medium text-slate-900">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${(cat.productCount || 0) > 0
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            <Package className="w-3 h-3" />
                                            {cat.productCount || 0} sản phẩm
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(cat)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Sửa"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            {deletingId === cat.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                                    >
                                                        Xoá
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(null)}
                                                        className="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                                    >
                                                        Huỷ
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeletingId(cat.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xoá"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                    ❌ {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Tên danh mục <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={e => setCategoryName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                                    placeholder="VD: Bàn phím cơ, Tai nghe gaming..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Huỷ
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 font-medium"
                                >
                                    {saving ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
