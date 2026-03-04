import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/app/components/Logo';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

const API_URL = 'https://localhost:7033/api';

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (!token || !email) {
            setError('Link đặt lại mật khẩu không hợp lệ');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    token,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Có lỗi xảy ra');
            }
        } catch {
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra params
    if (!token || !email) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Link không hợp lệ</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="text-red-600 hover:text-red-700 font-semibold"
                    >
                        Yêu cầu link mới →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 text-9xl animate-pulse">🔑</div>
                <div className="absolute bottom-10 left-10 text-8xl animate-bounce">🛡️</div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center relative">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400"></div>
                        <div className="flex justify-center mb-4">
                            <Logo />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Đặt lại mật khẩu</h1>
                        <p className="text-yellow-100 text-sm">Tạo mật khẩu mới cho tài khoản</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {success ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Thành công!</h2>
                                <p className="text-gray-600 text-sm">
                                    Mật khẩu đã được thay đổi. Bạn có thể đăng nhập bằng mật khẩu mới.
                                </p>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg"
                                >
                                    🎊 Đăng nhập ngay
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email display */}
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Đổi mật khẩu cho</p>
                                    <p className="font-semibold text-gray-800">{email}</p>
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                                        Mật khẩu mới
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Ít nhất 6 ký tự"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                                            required
                                            minLength={6}
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

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                        Xác nhận mật khẩu mới
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                        <p className="text-red-700 text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-base rounded-lg shadow-lg"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Đang xử lý...
                                        </div>
                                    ) : (
                                        '🔑 Đặt lại mật khẩu'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 text-sm font-medium"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Quay lại đăng nhập
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
