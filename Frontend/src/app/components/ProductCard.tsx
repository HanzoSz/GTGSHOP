import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ImageOff } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  categoryId?: number;
}

const IMAGE_BASE_URL = 'https://localhost:7033';

const getValidImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }

  // Nếu đã là URL đầy đủ
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Nếu là đường dẫn tương đối (bắt đầu bằng /)
  if (imageUrl.startsWith('/')) {
    return `${IMAGE_BASE_URL}${imageUrl}`;
  }

  // Các trường hợp khác
  return `${IMAGE_BASE_URL}/${imageUrl}`;
};

export function ProductCard(props: Product) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const isLiked = isInWishlist(Number(props.id));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: Number(props.id),
      name: props.name,
      price: props.price,
      image: props.image,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const imageUrl = getValidImageUrl(props.image);

  return (
    <Link
      to={`/product/${props.id}`}
      className="group bg-white rounded-xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={props.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          /* Placeholder khi không có hình hoặc lỗi */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageOff className="w-12 h-12 mb-2" />
            <span className="text-xs">Không có hình ảnh</span>
          </div>
        )}

        {/* Discount Badge */}
        {props.discount && props.discount > 0 && (
          <span className="absolute top-2 left-2 theme-discount-badge text-xs font-bold px-2 py-1 rounded-lg">
            -{props.discount}%
          </span>
        )}

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }
            toggleWishlist(Number(props.id));
          }}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'
              }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name */}
        <h3 className="font-medium text-gray-800 line-clamp-2 theme-hover-primary transition-colors min-h-[48px] mb-2">
          {props.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(props.rating || 0)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({props.reviews || 0})</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-3">
            <span className="text-lg font-bold theme-text-primary">
              {formatPrice(props.price)}
            </span>
            {props.originalPrice && props.originalPrice > props.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(props.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full theme-gradient text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </Link>
  );
}