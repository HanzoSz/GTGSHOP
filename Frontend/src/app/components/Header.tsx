import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Phone, MapPin, LogOut, ChevronDown, Package, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SearchDropdown } from './SearchDropDown';
import { getCategories, Category } from '../../services/api';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { totalItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Hotline: 0901 234 567
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>🎊 SALE TẾT 2026 - GIẢM ĐẾN 50% 🎊</span>
            <Link to="/stores" className="flex items-center gap-1 hover:underline">
              <MapPin className="w-3 h-3" />
              Tìm cửa hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Search */}
          <SearchDropdown className="flex-1 max-w-2xl" />

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:text-red-600 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs text-gray-500">Xin chào,</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                      {user.fullName}
                      <ChevronDown className="w-4 h-4" />
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-b">
                        <p className="font-semibold text-gray-800">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          <span>Tài khoản của tôi</span>
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-500" />
                          <span>Đơn hàng của tôi</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span>Cài đặt</span>
                        </Link>
                      </div>

                      <div className="border-t py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 hover:text-red-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block">Đăng nhập</span>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative hover:text-red-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation - Dynamic from API */}
      <nav className="border-t bg-white">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto py-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/category/${cat.id}`}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg whitespace-nowrap transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}