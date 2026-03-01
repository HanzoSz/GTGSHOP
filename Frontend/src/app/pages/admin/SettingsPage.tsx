import { useState } from 'react';
import { Upload, Save, Eye, Trash2, Plus, Calendar, Palette, Image } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ThemeManagement } from '@/app/components/ThemeManagement';

interface BannerConfig {
    id: string;
    name: string;
    title: string;
    description: string;
    bgGradient: string;
    textColor: string;
    buttonText: string;
    icon: string;
    isActive: boolean;
    imageUrl?: string;
}

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'banner' | 'theme'>('banner');
    const [banners, setBanners] = useState<BannerConfig[]>([
        {
            id: 'tet',
            name: 'Tết Nguyên Đán 2026',
            title: '🎊 SALE TẾT 2026 - GIẢM ĐẾN 50% 🎊',
            description: 'Săn deal HOT linh kiện PC - Rinh quà khủng đón Tết',
            bgGradient: 'from-red-600 via-orange-500 to-yellow-500',
            textColor: 'text-white',
            buttonText: 'MUA NGAY',
            icon: '🧧',
            isActive: true,
        },
        {
            id: 'summer',
            name: 'Mùa Hè Sôi Động',
            title: '☀️ SUMMER SALE - GIẢM ĐẾN 40% ☀️',
            description: 'Hè rực rỡ - Deal PC cháy túi - Mua linh kiện ngay',
            bgGradient: 'from-blue-400 via-cyan-400 to-teal-400',
            textColor: 'text-white',
            buttonText: 'KHÁM PHÁT',
            icon: '🏖️',
            isActive: false,
        },
        {
            id: 'midautumn',
            name: 'Tết Trung Thu',
            title: '🏮 TRUNG THU VUI VẺ - ƯU ĐÃI 35% 🏮',
            description: 'Rước đèn lồng - Rinh PC mới - Sale linh kiện khủng',
            bgGradient: 'from-yellow-500 via-orange-500 to-red-500',
            textColor: 'text-white',
            buttonText: 'MUA NGAY',
            icon: '🥮',
            isActive: false,
        },
        {
            id: 'christmas',
            name: 'Giáng Sinh',
            title: '🎄 GIÁNG SINH AN LÀNH - GIẢM 45% 🎄',
            description: 'Merry Christmas - Quà tặng PC xịn - Deal linh kiện hot',
            bgGradient: 'from-red-600 via-green-600 to-red-600',
            textColor: 'text-white',
            buttonText: 'NHẬN QUÀ',
            icon: '🎅',
            isActive: false,
        },
        {
            id: 'blackfriday',
            name: 'Black Friday',
            title: '⚡ BLACK FRIDAY - SIÊU SALE 60% ⚡',
            description: 'Chỉ 1 ngày - Deal khủng nhất năm - PC gaming giá sốc',
            bgGradient: 'from-slate-900 via-slate-700 to-slate-900',
            textColor: 'text-yellow-400',
            buttonText: 'MUA LIỀN',
            icon: '🔥',
            isActive: false,
        },
        {
            id: 'newyear',
            name: 'Năm Mới',
            title: '🎆 HAPPY NEW YEAR - GIẢM 40% 🎆',
            description: 'Chúc mừng năm mới - Build PC mới - Khuyến mãi khủng',
            bgGradient: 'from-purple-600 via-pink-500 to-blue-500',
            textColor: 'text-white',
            buttonText: 'CHỐT ĐƠN',
            icon: '🎉',
            isActive: false,
        },
    ]);

    const [editingBanner, setEditingBanner] = useState<BannerConfig | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleActivateBanner = (bannerId: string) => {
        setBanners(banners.map(b => ({
            ...b,
            isActive: b.id === bannerId
        })));

        // Lưu banner active vào localStorage
        const activeBanner = banners.find(b => b.id === bannerId);
        if (activeBanner) {
            const bannerToSave = { ...activeBanner, isActive: true };
            localStorage.setItem('activeBanner', JSON.stringify(bannerToSave));

            // Dispatch event để DynamicBanner cập nhật
            window.dispatchEvent(new CustomEvent('bannerChanged', { detail: bannerToSave }));
        }

        alert(`Banner "${banners.find(b => b.id === bannerId)?.name}" đã được kích hoạt và hiển thị trên website!`);
    };

    const handleEditBanner = (banner: BannerConfig) => {
        setEditingBanner({ ...banner });
    };

    const handleSaveBanner = () => {
        if (!editingBanner) return;

        setBanners(banners.map(b =>
            b.id === editingBanner.id ? editingBanner : b
        ));
        setEditingBanner(null);
        alert('Đã lưu thay đổi banner!');
    };

    const handleDeleteBanner = (bannerId: string) => {
        if (confirm('Bạn có chắc muốn xóa banner này?')) {
            setBanners(banners.filter(b => b.id !== bannerId));
            alert('Đã xóa banner!');
        }
    };

    const handleAddBanner = () => {
        const newBanner: BannerConfig = {
            id: `custom_${Date.now()}`,
            name: 'Banner mới',
            title: 'TIÊU ĐỀ BANNER',
            description: 'Mô tả banner của bạn',
            bgGradient: 'from-blue-600 to-purple-600',
            textColor: 'text-white',
            buttonText: 'MUA NGAY',
            icon: '🎁',
            isActive: false,
        };
        setBanners([...banners, newBanner]);
    };

    const activeBanner = banners.find(b => b.isActive);

    return (
        <div className="space-y-6">
            {/* Page Header with Tabs */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Cài đặt Giao diện</h1>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('banner')}
                        className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'banner'
                                ? 'text-red-600 border-b-2 border-red-600'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Image className="w-5 h-5" />
                            Quản lý Banner
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('theme')}
                        className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'theme'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            Quản lý Theme
                        </div>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'banner' && (
                <div className="space-y-6">
                    {/* Add Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleAddBanner}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Thêm Banner Mới
                        </Button>
                    </div>

                    {/* Current Active Banner Preview */}
                    {activeBanner && (
                        <Card className="p-6 border-2 border-green-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <h2 className="text-xl font-bold text-slate-900">Banner Đang Kích Hoạt</h2>
                                </div>
                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                    ĐANG HIỂN THỊ
                                </span>
                            </div>
                            <div className={`bg-gradient-to-r ${activeBanner.bgGradient} p-8 rounded-xl`}>
                                <div className="text-center">
                                    <h2 className={`text-4xl font-black ${activeBanner.textColor} mb-3`}>
                                        {activeBanner.title}
                                    </h2>
                                    <p className={`text-xl ${activeBanner.textColor} mb-6 opacity-90`}>
                                        {activeBanner.description}
                                    </p>
                                    <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform">
                                        {activeBanner.buttonText}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Banner List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {banners.map((banner) => (
                            <Card key={banner.id} className={`p-6 ${banner.isActive ? 'border-2 border-green-500' : 'border-slate-200'}`}>
                                {/* Banner Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">{banner.icon}</div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{banner.name}</h3>
                                            {banner.isActive && (
                                                <span className="text-xs text-green-600 font-semibold">✓ Đang kích hoạt</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeleteBanner(banner.id)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Banner Preview */}
                                <div className={`bg-gradient-to-r ${banner.bgGradient} p-6 rounded-lg mb-4`}>
                                    <h4 className={`font-bold text-lg ${banner.textColor} mb-2`}>
                                        {banner.title}
                                    </h4>
                                    <p className={`text-sm ${banner.textColor} opacity-90 mb-3`}>
                                        {banner.description}
                                    </p>
                                    <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold">
                                        {banner.buttonText}
                                    </button>
                                </div>

                                {/* Banner Info */}
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Gradient:</span>
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                            {banner.bgGradient}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Màu chữ:</span>
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                            {banner.textColor}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {!banner.isActive && (
                                        <Button
                                            onClick={() => handleActivateBanner(banner.id)}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Kích hoạt
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => handleEditBanner(banner)}
                                        variant="outline"
                                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Chỉnh sửa
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Edit Modal */}
                    {editingBanner && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Chỉnh sửa Banner</h2>

                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Tên banner
                                        </label>
                                        <input
                                            type="text"
                                            value={editingBanner.name}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Tiêu đề banner
                                        </label>
                                        <input
                                            type="text"
                                            value={editingBanner.title}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Mô tả
                                        </label>
                                        <textarea
                                            value={editingBanner.description}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    {/* Icon */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Icon (Emoji)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingBanner.icon}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, icon: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="🎊"
                                        />
                                    </div>

                                    {/* Background Gradient */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Gradient nền (Tailwind classes)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingBanner.bgGradient}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, bgGradient: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                                            placeholder="from-red-600 via-orange-500 to-yellow-500"
                                        />
                                    </div>

                                    {/* Text Color */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Màu chữ (Tailwind class)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingBanner.textColor}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, textColor: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                                            placeholder="text-white"
                                        />
                                    </div>

                                    {/* Button Text */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Text nút CTA
                                        </label>
                                        <input
                                            type="text"
                                            value={editingBanner.buttonText}
                                            onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>

                                    {/* Preview */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Xem trước
                                        </label>
                                        <div className={`bg-gradient-to-r ${editingBanner.bgGradient} p-6 rounded-lg`}>
                                            <h4 className={`font-bold text-lg ${editingBanner.textColor} mb-2`}>
                                                {editingBanner.title}
                                            </h4>
                                            <p className={`text-sm ${editingBanner.textColor} opacity-90 mb-3`}>
                                                {editingBanner.description}
                                            </p>
                                            <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold">
                                                {editingBanner.buttonText}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex gap-3 mt-6">
                                    <Button
                                        onClick={handleSaveBanner}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        Lưu thay đổi
                                    </Button>
                                    <Button
                                        onClick={() => setEditingBanner(null)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Help Section */}
                    <Card className="p-6 bg-blue-50 border-blue-200">
                        <h3 className="font-bold text-slate-900 mb-3">💡 Hướng dẫn sử dụng</h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                            <li>✓ Click <strong>"Kích hoạt"</strong> để banner hiển thị trên website</li>
                            <li>✓ Click <strong>"Chỉnh sửa"</strong> để thay đổi nội dung, màu sắc banner</li>
                            <li>✓ Sử dụng Tailwind CSS classes cho gradient và màu chữ</li>
                            <li>✓ Ví dụ gradient: <code className="bg-white px-2 py-1 rounded">from-red-600 to-blue-600</code></li>
                            <li>✓ Chỉ có 1 banner được kích hoạt tại một thời điểm</li>
                        </ul>
                    </Card>
                </div>
            )}

            {activeTab === 'theme' && (
                <div className="space-y-6">
                    <ThemeManagement />
                </div>
            )}
        </div>
    );
}