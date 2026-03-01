import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, Phone } from 'lucide-react';
import { Logo } from '@/app/components/Logo';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phone,
    });

    setLoading(false);

    if (result.success) {
      alert('🎉 Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      setError(result.message || 'Đăng ký thất bại');
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
        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400"></div>
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Đăng ký tài khoản</h1>
            <p className="text-yellow-100 text-sm">Tham gia cùng GTG Shop - Rinh quà Tết 2026</p>
            <div className="absolute -bottom-1 left-0 right-0 h-3 bg-yellow-400" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 90% 0, 80% 100%, 70% 0, 60% 100%, 50% 0, 40% 100%, 30% 0, 20% 100%, 10% 0, 0 100%)' }}></div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 font-medium">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0901 234 567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-red-600 hover:text-red-700 font-semibold">
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-red-600 hover:text-red-700 font-semibold">
                    Chính sách bảo mật
                  </a>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Register Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-base rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng ký...
                  </div>
                ) : (
                  '🎊 Đăng ký tài khoản'
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-semibold">
                  Đăng nhập ngay
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
            🧧 Chúc mừng năm mới 2025! 🧧
          </p>
        </div>
      </div>
    </div>
  );
}
