import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, UserPlus, XCircle, Loader2, RefreshCw, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import {
    getAdminAnalytics,
    type AnalyticsData,
} from '@/services/api';

const PIE_COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1', '#14b8a6'];

export function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const result = await getAdminAnalytics();
        setData(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const formatShortPrice = (price: number) => {
        if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}tỷ`;
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}tr`;
        if (price >= 1000) return `${(price / 1000).toFixed(0)}k`;
        return price.toString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                <span className="ml-4 text-lg text-slate-500">Đang tải dữ liệu thống kê...</span>
            </div>
        );
    }

    if (!data) return null;
    const { keyMetrics, revenueChart, revenueThisWeek, revenueLastWeek, categorySales, topSellers } = data;

    // Tính % thay đổi doanh thu tuần
    const weeklyChange = revenueLastWeek > 0
        ? ((revenueThisWeek - revenueLastWeek) / revenueLastWeek * 100).toFixed(1)
        : revenueThisWeek > 0 ? '100' : '0';
    const isWeekUp = revenueThisWeek >= revenueLastWeek;

    // Tổng doanh thu theo danh mục (cho pie chart)
    const totalCategoryRevenue = categorySales.reduce((sum, c) => sum + c.totalRevenue, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Thống kê</h1>
                    <p className="text-slate-500 mt-1">Phân tích chi tiết hiệu suất kinh doanh</p>
                </div>
                <Button onClick={fetchData} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Làm mới
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Tổng doanh thu</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatPrice(keyMetrics.totalRevenue)}</p>
                    <p className="text-xs text-slate-400 mt-2">Tất cả đơn hàng thành công</p>
                </Card>

                <Card className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        {keyMetrics.ordersToday > 0 && (
                            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +{keyMetrics.ordersToday}
                            </span>
                        )}
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Đơn hàng hôm nay</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{keyMetrics.ordersToday}</p>
                    <p className="text-xs text-slate-400 mt-2">Tổng cộng: {keyMetrics.totalOrders} đơn</p>
                </Card>

                <Card className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        {keyMetrics.newCustomersToday > 0 && (
                            <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" />
                                +{keyMetrics.newCustomersToday}
                            </span>
                        )}
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Khách hàng mới hôm nay</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{keyMetrics.newCustomersToday}</p>
                    <p className="text-xs text-slate-400 mt-2">Đăng ký trong ngày</p>
                </Card>

                <Card className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-white" />
                        </div>
                        {keyMetrics.cancelRate > 10 && (
                            <span className="text-sm font-semibold text-red-600 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Cao
                            </span>
                        )}
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Tỷ lệ hủy đơn</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{keyMetrics.cancelRate}%</p>
                    <p className="text-xs text-slate-400 mt-2">{keyMetrics.cancelledOrders}/{keyMetrics.totalOrders} đơn bị hủy</p>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="p-6 border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Biểu đồ doanh thu</h2>
                        <p className="text-sm text-slate-500 mt-1">So sánh 14 ngày gần nhất (tuần trước vs tuần này)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Tuần này</p>
                            <p className="text-lg font-bold text-red-600">{formatPrice(revenueThisWeek)}</p>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${isWeekUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isWeekUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {isWeekUp ? '+' : ''}{weeklyChange}%
                        </div>
                    </div>
                </div>

                {revenueChart.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Chưa có dữ liệu doanh thu</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={revenueChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis
                                tickFormatter={(v) => formatShortPrice(v)}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <Tooltip
                                formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                                labelStyle={{ color: '#334155', fontWeight: 'bold' }}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#ef4444"
                                strokeWidth={3}
                                dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, fill: '#ef4444', stroke: '#fff', strokeWidth: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-8 mt-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-slate-300"></div>
                        <span>Tuần trước (7 ngày đầu)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-red-500"></div>
                        <span>Tuần này (7 ngày sau)</span>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Sales - Pie Chart */}
                <Card className="p-6 border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Doanh thu theo danh mục</h2>
                    <p className="text-sm text-slate-500 mb-4">Phân bố doanh thu theo nhóm sản phẩm</p>

                    {categorySales.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Chưa có dữ liệu</p>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categorySales}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={110}
                                        paddingAngle={3}
                                        dataKey="totalRevenue"
                                        nameKey="categoryName"
                                        label={({ categoryName, percent }) =>
                                            `${categoryName} (${(percent * 100).toFixed(0)}%)`
                                        }
                                        labelLine={{ stroke: '#94a3b8' }}
                                    >
                                        {categorySales.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Category Details List */}
                            <div className="space-y-2 mt-4">
                                {categorySales.map((cat, idx) => {
                                    const percentage = totalCategoryRevenue > 0
                                        ? ((cat.totalRevenue / totalCategoryRevenue) * 100).toFixed(1)
                                        : '0';
                                    return (
                                        <div key={cat.categoryId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                            />
                                            <span className="flex-1 text-sm text-slate-700 font-medium">{cat.categoryName}</span>
                                            <span className="text-sm text-slate-500">{cat.totalQuantity} SP</span>
                                            <span className="text-sm font-semibold text-slate-900">{formatPrice(cat.totalRevenue)}</span>
                                            <span className="text-xs text-slate-400 w-12 text-right">{percentage}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Card>

                {/* Top Sellers */}
                <Card className="p-6 border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Sản phẩm bán chạy</h2>
                    <p className="text-sm text-slate-500 mb-4">Top 5 sản phẩm có số lượng bán cao nhất</p>

                    {topSellers.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Chưa có dữ liệu</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {topSellers.map((product, index) => {
                                const maxSold = topSellers[0]?.totalSold || 1;
                                const barWidth = (product.totalSold / maxSold) * 100;
                                return (
                                    <div key={product.productId} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            {/* Rank Badge */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                                                index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500 text-white' :
                                                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {index + 1}
                                            </div>

                                            {/* Product Image */}
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.productName}
                                                    className="w-10 h-10 object-cover rounded-lg border flex-shrink-0"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 text-sm truncate">{product.productName}</p>
                                                <p className="text-xs text-slate-500">
                                                    Đã bán: <span className="font-semibold text-blue-600">{product.totalSold}</span>
                                                    {' '}• Tồn kho: <span className={`font-semibold ${product.currentStock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {product.currentStock}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* Revenue */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-bold text-slate-900">{formatPrice(product.totalRevenue)}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="ml-11 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                                    index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                                            'bg-slate-300'
                                                    }`}
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
