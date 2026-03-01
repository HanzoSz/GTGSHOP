import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ShoppingBag, Home, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';

export function VnPayReturnPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'success' | 'failed' | 'loading'>('loading');
    const [orderCode, setOrderCode] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const success = searchParams.get('success');
        const code = searchParams.get('orderCode') || '';
        const msg = searchParams.get('message') || '';

        setOrderCode(code);
        setMessage(msg);

        // Delay nhẹ để animation loading
        setTimeout(() => {
            setStatus(success === 'True' || success === 'true' ? 'success' : 'failed');
        }, 1500);
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-lg mx-auto">
                    {/* Loading */}
                    {status === 'loading' && (
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 relative">
                                <div className="w-20 h-20 border-4 border-gray-200 rounded-full animate-spin border-t-red-600"></div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán...</h1>
                            <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
                        </div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <div className="text-center">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircle className="w-14 h-14 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán thành công! 🎉</h1>
                            <p className="text-gray-500 mb-6">Cảm ơn bạn đã mua hàng tại GTG Shop</p>

                            {/* Order Code */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
                                <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                                <p className="text-2xl font-bold text-red-600">{orderCode}</p>
                                <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    {message || 'Đã thanh toán qua VNPay'}
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 mb-6 text-left border border-orange-100">
                                <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Thông tin giao hàng
                                </h3>
                                <p className="text-sm text-orange-700">
                                    Đơn hàng đã được <strong>xác nhận tự động</strong> sau khi thanh toán thành công.
                                </p>
                                <p className="text-sm text-orange-700 mt-1">
                                    Dự kiến giao hàng: <strong>2-3 ngày làm việc</strong>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <Link to="/orders" className="flex-1">
                                    <Button variant="outline" className="w-full gap-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        Xem đơn hàng
                                    </Button>
                                </Link>
                                <Link to="/" className="flex-1">
                                    <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 gap-2">
                                        Tiếp tục mua sắm
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Failed */}
                    {status === 'failed' && (
                        <div className="text-center">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-14 h-14 text-red-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán thất bại 😔</h1>
                            <p className="text-gray-500 mb-6">Giao dịch không thành công</p>

                            {/* Error Info */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
                                {orderCode && (
                                    <>
                                        <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                                        <p className="text-xl font-bold text-gray-700 mb-3">{orderCode}</p>
                                    </>
                                )}
                                <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
                                    <XCircle className="w-4 h-4" />
                                    {message || 'Giao dịch bị hủy hoặc thất bại'}
                                </div>
                            </div>

                            {/* Help Text */}
                            <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-left border border-yellow-100">
                                <h3 className="font-semibold text-yellow-800 mb-2">💡 Gợi ý</h3>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• Đơn hàng vẫn được lưu với trạng thái <strong>chờ thanh toán</strong></li>
                                    <li>• Bạn có thể thử lại thanh toán trong phần <strong>Đơn hàng của tôi</strong></li>
                                    <li>• Hoặc liên hệ <strong>Hotline: 0901 234 567</strong> để được hỗ trợ</li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <Link to="/orders" className="flex-1">
                                    <Button variant="outline" className="w-full gap-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        Đơn hàng của tôi
                                    </Button>
                                </Link>
                                <Link to="/" className="flex-1">
                                    <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 gap-2">
                                        <Home className="w-4 h-4" />
                                        Về trang chủ
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
