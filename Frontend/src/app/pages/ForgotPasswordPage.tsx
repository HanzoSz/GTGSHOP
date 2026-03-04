import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/app/components/Logo';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

const API_URL = 'https://localhost:7033/api';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-9xl animate-pulse">🔐</div>
                <div className="absolute bottom-10 right-10 text-8xl animate-bounce">🔑</div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center relative">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400"></div>
                        <div className="flex justify-center mb-4">
                            <Logo />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Quên mật khẩu</h1>
                        <p className="text-yellow-100 text-sm">Nhập email để nhận link đặt lại mật khẩu</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {success ? (
                            /* Success State */
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Đã gửi email!</h2>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Nếu email <strong>{email}</strong> tồn tại trong hệ thống,
                                    chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
                                    Vui lòng kiểm tra hộp thư (bao gồm thư rác).
                                </p>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-amber-800 text-xs">
                                        ⏰ Link sẽ hết hạn sau <strong>15 phút</strong>
                                    </p>
                                </div>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold mt-4"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        ) : (
                            /* Form State */
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">
                                        Email đăng ký
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Nhập email của bạn"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-12 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                                            required
                                        />
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
                                            Đang gửi...
                                        </div>
                                    ) : (
                                        '📧 Gửi link đặt lại mật khẩu'
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
