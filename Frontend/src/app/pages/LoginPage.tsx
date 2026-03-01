import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Logo } from '@/app/components/Logo';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Tet elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-9xl animate-pulse">🏮</div>
        <div className="absolute top-20 right-10 text-8xl animate-bounce">🧧</div>
        <div className="absolute bottom-10 left-1/4 text-9xl animate-pulse">🌸</div>
        <div className="absolute bottom-10 right-1/4 text-8xl animate-bounce">🎆</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400"></div>
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Chào mừng trở lại!</h1>
            <p className="text-yellow-100 text-sm">Đăng nhập để mua sắm linh kiện Tết 2026</p>
            <div className="absolute -bottom-1 left-0 right-0 h-3 bg-yellow-400" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 90% 0, 80% 100%, 70% 0, 60% 100%, 50% 0, 40% 100%, 30% 0, 20% 100%, 10% 0, 0 100%)' }}></div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email / Tên đăng nhập
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="admin@gtg.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                  Quên mật khẩu?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-base rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  '🎊 Đăng nhập'
                )}
              </Button>

              {/* Demo Account Info */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <p className="text-xs font-semibold text-yellow-800 mb-2">🎁 Demo Account:</p>
                <p className="text-xs text-yellow-700">Email: <strong>admin@gtg.vn</strong></p>
                <p className="text-xs text-yellow-700">Mật khẩu: <strong>123456</strong></p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập với</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-2 hover:bg-gray-50"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-2 hover:bg-gray-50"
                >
                  <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5 mr-2" />
                  Facebook
                </Button>
              </div>

              {/* Register Link */}
              <p className="text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-red-600 hover:text-red-700 font-semibold">
                  Đăng ký ngay 🎊
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white hover:text-yellow-300 font-medium transition-colors"
          >
            ← Quay về trang chủ
          </Link>
        </div>

        {/* Tet Greeting */}
        <div className="mt-6 text-center">
          <p className="text-yellow-300 font-bold text-lg animate-pulse">
            🧧 Chúc mừng năm mới 2026! 🧧
          </p>
        </div>
      </div>
    </div>
  );
}
