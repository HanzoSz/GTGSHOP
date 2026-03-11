import { API_URL, IMAGE_BASE_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Lock,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  Package,
  Heart,
  LogOut,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  createdAt: string;
  avatar?: string;
}

type TabType = 'profile' | 'security' | 'orders' | 'wishlist';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    createdAt: '',
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        console.log('API Profile Response:', data); // Debug

        const profileData = {
          id: data.id || data.Id,
          fullName: data.fullName || data.FullName || '',
          email: data.email || data.Email || '',
          phoneNumber: data.phone || data.Phone || data.phoneNumber || data.PhoneNumber || '',
          address: data.address || data.Address || '',
          createdAt: data.createdAt || data.CreatedAt || '',
          avatar: data.avatar || data.Avatar,
        };

        console.log('Parsed profileData:', profileData);

        setProfile(profileData);
        setEditForm({
          fullName: profileData.fullName,
          phoneNumber: profileData.phoneNumber || '',
          address: profileData.address || '',
        });
      }
    } catch (error) {
      console.error('Load profile error:', error);
      if (user) {
        setProfile({
          id: user.id || 0,
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNumber: '',
          address: '',
          createdAt: new Date().toISOString(),
        });
        setEditForm({
          fullName: user.fullName || '',
          phoneNumber: '',
          address: '',
        });
      }
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          fullName: editForm.fullName,
          phoneNumber: editForm.phoneNumber,
          address: editForm.address,
        }));
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });

        if (updateUser) {
          updateUser({ fullName: editForm.fullName });
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Cập nhật thất bại' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (): boolean => {
    const errors: string[] = [];

    if (!passwordForm.currentPassword) {
      errors.push('Vui lòng nhập mật khẩu hiện tại');
    }
    if (!passwordForm.newPassword) {
      errors.push('Vui lòng nhập mật khẩu mới');
    } else if (passwordForm.newPassword.length < 6) {
      errors.push('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.push('Mật khẩu xác nhận không khớp');
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.push('Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors([]);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Mật khẩu hiện tại không đúng' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(profile.fullName)
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-red-600 shadow-lg hover:bg-gray-100">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold">{profile.fullName || 'Người dùng'}</h1>
                <p className="text-white/80 flex items-center justify-center md:justify-start gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
                <p className="text-white/60 text-sm mt-2 flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Thành viên từ {formatDate(profile.createdAt)}
                </p>
              </div>

              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-white/70 text-sm">Đơn hàng</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{wishlistCount}</p>
                  <p className="text-white/70 text-sm">Yêu thích</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p>{message.text}</p>
              <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-white/50 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="md:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <nav className="divide-y">
                  {[
                    { id: 'profile' as TabType, icon: User, label: 'Thông tin cá nhân' },
                    { id: 'security' as TabType, icon: Shield, label: 'Bảo mật' },
                    { id: 'orders' as TabType, icon: Package, label: 'Đơn hàng của tôi' },
                    { id: 'wishlist' as TabType, icon: Heart, label: 'Sản phẩm yêu thích' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'orders') navigate('/orders');
                        else if (tab.id === 'wishlist') navigate('/wishlist');
                        else setActiveTab(tab.id);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === tab.id ? 'bg-red-50 text-red-600 border-l-4 border-red-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-red-600" />
                      Thông tin cá nhân
                    </h2>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={() => { setIsEditing(false); setEditForm({ fullName: profile.fullName, phoneNumber: profile.phoneNumber || '', address: profile.address || '' }); }} variant="outline">
                          <X className="w-4 h-4" /> Hủy
                        </Button>
                        <Button onClick={handleUpdateProfile} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                          <Save className="w-4 h-4" /> {isLoading ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                      {isEditing ? (
                        <input type="text" value={editForm.fullName} onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500" placeholder="Nhập họ và tên" />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <User className="w-5 h-5 text-gray-400" />
                          <span>{profile.fullName || 'Chưa cập nhật'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-xs text-gray-500">(Không thể thay đổi)</span></label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">{profile.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      {isEditing ? (
                        <input type="tel" value={editForm.phoneNumber} onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500" placeholder="Nhập số điện thoại" />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span>{profile.phoneNumber || 'Chưa cập nhật'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                      {isEditing ? (
                        <textarea value={editForm.address} onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))} rows={3} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 resize-none" placeholder="Nhập địa chỉ" />
                      ) : (
                        <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <span>{profile.address || 'Chưa cập nhật'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tham gia</label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span>{formatDate(profile.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Lock className="w-5 h-5 text-red-600" />
                    Đổi mật khẩu
                  </h2>

                  {passwordErrors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <ul className="space-y-1">
                        {passwordErrors.map((error, index) => (
                          <li key={index} className="text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <input type={showPasswords.current ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} className="w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-red-500" placeholder="Nhập mật khẩu hiện tại" />
                        <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                      <div className="relative">
                        <input type={showPasswords.new ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} className="w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-red-500" placeholder="Nhập mật khẩu mới" />
                        <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} className="w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-red-500" placeholder="Nhập lại mật khẩu mới" />
                        <button type="button" onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button onClick={handleChangePassword} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 py-3">
                      {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">💡 Mẹo bảo mật</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Sử dụng mật khẩu có ít nhất 8 ký tự</li>
                      <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                      <li>• Không sử dụng thông tin cá nhân làm mật khẩu</li>
                      <li>• Thay đổi mật khẩu định kỳ</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}