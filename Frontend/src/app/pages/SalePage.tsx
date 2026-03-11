import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Flame, ChevronLeft, ChevronRight, SlidersHorizontal, Tag, Loader2, Package } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard, type Product } from '../components/ProductCard';
import axios from 'axios';

import { API_URL } from '@/config';

interface SaleApiResponse {
    items: any[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export function SalePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState('');
    const pageSize = 12;

    const fetchSaleProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                page: currentPage,
                pageSize,
            };
            if (searchTerm) params.search = searchTerm;
            if (sort) params.sort = sort;

            const response = await axios.get<SaleApiResponse>(`${API_URL}/products/sale`, { params });
            const data = response.data;

            const mapped: Product[] = (data.items || []).map((item: any) => ({
                id: item.id,
                name: item.name || '',
                price: item.price || 0,
                originalPrice: item.originalPrice,
                image: item.image || item.imageUrl || '',
                rating: item.rating || 0,
                reviews: item.reviews || 0,
                discount: item.discount || 0,
                categoryId: item.categoryId,
            }));

            setProducts(mapped);
            setTotalItems(data.totalItems || 0);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Lỗi tải sản phẩm giảm giá:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, sort]);

    useEffect(() => {
        fetchSaleProducts();
    }, [fetchSaleProducts]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Max discount for display
    const maxDiscount = products.length > 0
        ? Math.max(...products.map(p => p.discount || 0))
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Sale Banner */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                            <Flame className="w-8 h-8 text-yellow-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">Sản phẩm giảm giá</h1>
                            <p className="text-red-100 mt-1">
                                {totalItems > 0
                                    ? `${totalItems} sản phẩm đang được giảm giá tới ${maxDiscount}%`
                                    : 'Khám phá các deal hot nhất hôm nay'}
                            </p>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-red-200">
                        <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-white font-medium">Sản phẩm giảm giá</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Filters Bar */}
                <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm giảm giá..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                            <select
                                value={sort}
                                onChange={(e) => { setSort(e.target.value); setCurrentPage(1); }}
                                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="">Giảm giá nhiều nhất</option>
                                <option value="price-asc">Giá: Thấp → Cao</option>
                                <option value="price-desc">Giá: Cao → Thấp</option>
                                <option value="newest">Mới nhất</option>
                            </select>
                        </div>
                    </div>

                    {/* Result count */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Tag className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">
                            Tìm thấy <strong className="text-red-600">{totalItems}</strong> sản phẩm giảm giá
                        </span>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                        <span className="ml-4 text-gray-500">Đang tải sản phẩm...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
                        <p className="text-gray-400">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </button>

                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    // Smart pagination: show first, last, and nearby pages
                                    let pageNum: number;
                                    if (totalPages <= 7) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 6 + i;
                                    } else {
                                        pageNum = currentPage - 3 + i;
                                    }

                                    if (pageNum < 1 || pageNum > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                                : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Page info */}
                        <p className="text-center text-sm text-gray-400 mt-4">
                            Trang {currentPage}/{totalPages} — Hiển thị {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} trong {totalItems} sản phẩm
                        </p>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
