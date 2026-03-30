import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Logo } from '@/app/components/Logo';
import { useAuth } from '@/app/context/AuthContext';
import { AdminSearchDropdown } from '@/app/components/admin/AdminSearchDropdown';
import { AdminNotificationDropdown } from '@/app/components/admin/AdminNotificationDropdown';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, isAdminAuthenticated, isLoading, logoutAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Guard: redirect to admin login if not authenticated
  useEffect(() => {
    if (isLoading) return;
    if (!isAdminAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isLoading, isAdminAuthenticated, navigate]);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Quản lý sản phẩm' },
    { path: '/admin/categories', icon: FolderOpen, label: 'Quản lý danh mục' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Quản lý đơn hàng' },
    { path: '/admin/customers', icon: Users, label: 'Quản lý khách hàng' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Thống kê' },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
  ];

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      logoutAdmin();
      navigate('/admin/login');
    }
  };

  if (isLoading || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-slate-900 border-r border-slate-800`} style={{ width: '280px' }}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-red-600 to-orange-600">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <Logo />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">GTG Admin</h2>
                <p className="text-yellow-200 text-xs">Management Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-600 hover:text-white transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-slate-600"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>

                <AdminSearchDropdown />
              </div>

              <div className="flex items-center gap-4">
                <AdminNotificationDropdown />

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-slate-900">{adminUser?.fullName || 'Admin User'}</p>
                    <p className="text-xs text-slate-500">{adminUser?.email || 'admin@gtgshop.vn'}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold">
                    {(adminUser?.fullName || 'A').charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
