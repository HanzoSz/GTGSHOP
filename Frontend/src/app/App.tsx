import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Chatbot } from './components/Chatbot';
import { BuildPCFloatingButton } from './components/BuildPCFloatingButton';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoryPage } from './pages/CategoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { SalePage } from './pages/SalePage';
import { VnPayReturnPage } from './pages/VnPayReturnPage';
import { BuildPCPage } from './pages/BuildPCPage';
import { AdminLoginPage } from '@/app/pages/admin/AdminLoginPage';
import { AdminLayout } from '@/app/layouts/AdminLayout';
import { ProductManagementPage } from '@/app/pages/admin/ProductManagementPage';
import { OrderManagementPage } from '@/app/pages/admin/OrderManagementPage';
import { CustomerManagementPage } from '@/app/pages/admin/CustomerManagementPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SettingsPage } from '@/app/pages/admin/SettingsPage';
import { CategoryManagementPage } from '@/app/pages/admin/CategoryManagementPage';
// Wrapper component to conditionally show Chatbot based on route
function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isBuildPCPage = location.pathname === '/build-pc';

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/sale" element={<SalePage />} />
        <Route path="/payment/vnpay/return" element={<VnPayReturnPage />} />
        <Route path="/build-pc" element={<BuildPCPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><ProductManagementPage /></AdminLayout>} />
        <Route path="/admin/categories" element={<AdminLayout><CategoryManagementPage /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><OrderManagementPage /></AdminLayout>} />
        <Route path="/admin/customers" element={<AdminLayout><CustomerManagementPage /></AdminLayout>} />
        <Route path="/admin/analytics" element={<AdminLayout><AnalyticsPage /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
      </Routes>
      {/* Chatbot + Build PC button hiển thị trên tất cả trang (trừ admin) */}
      {!isAdminPage && <Chatbot />}
      {!isAdminPage && !isBuildPCPage && <BuildPCFloatingButton />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;