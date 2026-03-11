import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import { IMAGE_BASE_URL } from '@/config';

const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return 'https://via.placeholder.com/300x300?text=No+Image';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${IMAGE_BASE_URL}${imageUrl}`;
    return `${IMAGE_BASE_URL}/${imageUrl}`;
};

export function WishlistPage() {
    const navigate = useNavigate();
    const { items, removeFromWishlist, isLoading } = useWishlist();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const handleAddToCart = (item: typeof items[0]) => {
        addToCart({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: getImageUrl(item.image),
        });
    };

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập để xem yêu thích</h1>
                        <p className="text-gray-500 mb-8">
                            Bạn cần đăng nhập để sử dụng tính năng sản phẩm yêu thích.
                        </p>
                        <Button
                            onClick={() => navigate('/login')}
                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                        >
                            Đăng nhập ngay
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-gray-500">Đang tải danh sách yêu thích...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto text-center">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-12 h-12 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chưa có sản phẩm yêu thích</h1>
                        <p className="text-gray-500 mb-8">
                            Hãy khám phá và thêm sản phẩm bạn yêu thích vào danh sách!
                        </p>
                        <Link to="/">
                            <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Khám phá sản phẩm
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-red-600">Trang chủ</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">Sản phẩm yêu thích</span>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">
                        ❤️ Sản phẩm yêu thích
                        <span className="text-lg font-normal text-gray-500 ml-2">
                            ({items.length} sản phẩm)
                        </span>
                    </h1>
                </div>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.productId}
                            className="bg-white rounded-xl shadow-sm border overflow-hidden group hover:shadow-lg transition-shadow"
                        >
                            {/* Image */}
                            <Link to={`/product/${item.productId}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                                <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {item.discount > 0 && (
                                    <span className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                        -{item.discount}%
                                    </span>
                                )}
                                {/* Remove button on hover */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeFromWishlist(item.productId);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                    title="Xóa khỏi yêu thích"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </Link>

                            {/* Content */}
                            <div className="p-4">
                                <Link to={`/product/${item.productId}`}>
                                    <h3 className="font-medium text-gray-800 line-clamp-2 hover:text-red-600 transition-colors min-h-[48px] mb-2">
                                        {item.name}
                                    </h3>
                                </Link>

                                {/* Price */}
                                <p className="text-lg font-bold text-red-600 mb-3">
                                    {formatPrice(item.price)}
                                </p>

                                {/* Stock Status */}
                                <div className="mb-3">
                                    {item.stock > 0 ? (
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            Còn hàng ({item.stock})
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            Hết hàng
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.stock === 0}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-sm disabled:opacity-50"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-1" />
                                        Thêm vào giỏ
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => removeFromWishlist(item.productId)}
                                        className="border-red-200 text-red-600 hover:bg-red-50 px-3"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Continue Shopping */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mt-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Tiếp tục mua sắm
                </Link>
            </div>

            <Footer />
        </div>
    );
}
