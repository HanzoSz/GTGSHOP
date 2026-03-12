import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Phone, MapPin, LogOut, ChevronDown, Package, Settings, Gift, Copy, Check } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { SearchDropdown } from './SearchDropDown';
import { getCategories, Category, claimVoucher, getMyVouchers, Voucher } from '../../services/api';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { totalItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [claimedVoucher, setClaimedVoucher] = useState<Voucher | null>(null);
  const [voucherMessage, setVoucherMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleClaimVoucher = async () => {
    setVoucherLoading(true);
    setVoucherMessage('');
    try {
      const result = await claimVoucher();
      if (result.voucher) {
        setClaimedVoucher(result.voucher);
      }
      setVoucherMessage(result.message || '');
    } catch {
      setVoucherMessage('Có lỗi xảy ra');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleOpenVoucherModal = async () => {
    setShowVoucherModal(true);
    setCopied(false);
    // Kiểm tra user đã có voucher chưa
    try {
      const vouchers = await getMyVouchers();
      if (vouchers.length > 0) {
        setClaimedVoucher(vouchers[0]);
        setVoucherMessage('Bạn đã có voucher! Sử dụng ở giỏ hàng.');
      } else {
        setClaimedVoucher(null);
        setVoucherMessage('');
      }
    } catch {
      setClaimedVoucher(null);
      setVoucherMessage('');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="theme-gradient text-white text-sm py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Hotline: 087.997.9997 - 098.655.2233
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>🎊 SALE TẾT 2026 - GIẢM ĐẾN 25% 🎊</span>
            <a href="https://www.google.com/maps/place/M%C3%A1y+T%C3%ADnh+PCM/@21.0120902,105.8199834,19z/data=!4m6!3m5!1s0x3135adf3ddfe2f41:0x2f69910a2650fb88!8m2!3d21.0121923!4d105.8205101!16s%2Fg%2F11gxm5_gcn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
              <MapPin className="w-3 h-3" />
              Tìm cửa hàng
            </a>
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
            {/* Voucher Button - chỉ hiện khi đã đăng nhập */}
            {isAuthenticated && (
              <button
                onClick={handleOpenVoucherModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden md:inline">Voucher</span>
              </button>
            )}

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 theme-hover-primary transition-colors"
                >
                  <div className="w-9 h-9 theme-gradient rounded-full flex items-center justify-center text-white font-semibold">
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
                      <div className="px-4 py-3 border-b" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, white)' }}>
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
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full theme-text-primary"
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
                className="flex items-center gap-2 theme-hover-primary transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block">Đăng nhập</span>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative theme-hover-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 theme-badge text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowVoucherModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[61] w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Mã Giảm Giá</h3>
              <p className="text-sm text-gray-500 mb-4">Mỗi tài khoản nhận 1 voucher ngẫu nhiên 5-20%</p>
            </div>

            {claimedVoucher ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-400 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Mã của bạn</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-amber-700 tracking-widest">{claimedVoucher.code}</span>
                    <button
                      onClick={() => handleCopyCode(claimedVoucher.code)}
                      className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                      title="Sao chép mã"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
                    </button>
                  </div>
                  <p className="text-lg font-semibold text-red-600 mt-2">Giảm {claimedVoucher.discountPercent}%</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleClaimVoucher}
                disabled={voucherLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 mb-4"
              >
                {voucherLoading ? 'Đang xử lý...' : '🎁 Nhận Voucher Ngay!'}
              </button>
            )}

            {voucherMessage && (
              <p className="text-sm text-center text-gray-600 mb-3">{voucherMessage}</p>
            )}

            <button
              onClick={() => setShowVoucherModal(false)}
              className="w-full py-2 border rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              Đóng
            </button>
          </div>
        </>
      )}

      {/* Navigation - Dynamic from API */}
      <nav className="border-t bg-white">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto py-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/category/${cat.id}`}
                  className="px-3 py-2 text-sm font-medium text-gray-700 theme-nav-hover rounded-lg whitespace-nowrap transition-colors"
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