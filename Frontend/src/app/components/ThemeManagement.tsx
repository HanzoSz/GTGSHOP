import { useState } from 'react';
import { Palette, Check, RotateCcw } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useTheme } from '@/app/context/ThemeContext';
import { THEME_PRESETS, ThemeId } from '@/app/types/theme.types';

export function ThemeManagement() {
    const { currentTheme, themeId, setTheme, resetTheme } = useTheme();
    const [selectedTheme, setSelectedTheme] = useState<ThemeId>(themeId);

    const handleApplyTheme = (id: ThemeId) => {
        setTheme(id);
        setSelectedTheme(id);

        // Thông báo thành công
        alert(`✅ Theme "${THEME_PRESETS[id].name}" đã được áp dụng cho toàn bộ website!`);
    };

    const handleReset = () => {
        if (confirm('Bạn có chắc muốn reset về theme Tết mặc định?')) {
            resetTheme();
            setSelectedTheme('tet');
            alert('✅ Đã reset về theme mặc định!');
        }
    };

    const themeList: ThemeId[] = ['tet', 'noel', 'halloween', 'blackfriday', 'default'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Palette className="w-7 h-7 text-purple-600" />
                        Quản lý Theme Website
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Thay đổi toàn bộ màu sắc website theo dịp lễ
                    </p>
                </div>
                <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset mặc định
                </Button>
            </div>

            {/* Current Theme Preview */}
            <Card className="p-6 border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        <h3 className="text-xl font-bold text-slate-900">Theme Đang Sử Dụng</h3>
                    </div>
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                        {currentTheme.icon} {currentTheme.name}
                    </span>
                </div>

                {/* Color Palette Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                        <div
                            className="h-20 rounded-lg shadow-md mb-2"
                            style={{ backgroundColor: currentTheme.colors.primary }}
                        ></div>
                        <p className="text-xs font-semibold text-slate-600">Primary</p>
                        <p className="text-xs font-mono text-slate-500">{currentTheme.colors.primary}</p>
                    </div>
                    <div className="text-center">
                        <div
                            className="h-20 rounded-lg shadow-md mb-2"
                            style={{ backgroundColor: currentTheme.colors.secondary }}
                        ></div>
                        <p className="text-xs font-semibold text-slate-600">Secondary</p>
                        <p className="text-xs font-mono text-slate-500">{currentTheme.colors.secondary}</p>
                    </div>
                    <div className="text-center">
                        <div
                            className="h-20 rounded-lg shadow-md mb-2"
                            style={{ backgroundColor: currentTheme.colors.accent }}
                        ></div>
                        <p className="text-xs font-semibold text-slate-600">Accent</p>
                        <p className="text-xs font-mono text-slate-500">{currentTheme.colors.accent}</p>
                    </div>
                    <div className="text-center">
                        <div
                            className="h-20 rounded-lg shadow-md mb-2 border-2 border-slate-200"
                            style={{ backgroundColor: currentTheme.colors.background }}
                        ></div>
                        <p className="text-xs font-semibold text-slate-600">Background</p>
                        <p className="text-xs font-mono text-slate-500">{currentTheme.colors.background}</p>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
                    <h4 className="font-bold text-slate-700 mb-3">Xem trước Component:</h4>
                    <div className="space-y-3">
                        <button
                            className="px-6 py-3 rounded-lg font-bold text-white shadow-md hover:scale-105 transition-transform"
                            style={{ backgroundColor: currentTheme.colors.primary }}
                        >
                            Button Primary
                        </button>
                        <button
                            className="px-6 py-3 rounded-lg font-bold text-white shadow-md hover:scale-105 transition-transform ml-3"
                            style={{ backgroundColor: currentTheme.colors.secondary }}
                        >
                            Button Secondary
                        </button>
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor: currentTheme.colors.background,
                                color: currentTheme.colors.text,
                                border: `2px solid ${currentTheme.colors.border}`
                            }}
                        >
                            <p className="font-semibold">Card Example</p>
                            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                                Đây là preview card với theme hiện tại
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Theme Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themeList.map((id) => {
                    const theme = THEME_PRESETS[id];
                    const isActive = themeId === id;
                    const isSelected = selectedTheme === id;

                    return (
                        <Card
                            key={id}
                            className={`p-6 cursor-pointer transition-all hover:shadow-xl ${isActive
                                ? 'border-2 border-purple-500 shadow-lg'
                                : 'border-slate-200 hover:border-purple-300'
                                }`}
                            onClick={() => setSelectedTheme(id)}
                        >
                            {/* Theme Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl">{theme.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{theme.name}</h3>
                                        {isActive && (
                                            <span className="text-xs text-purple-600 font-semibold">
                                                ✓ Đang sử dụng
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {isActive && (
                                    <Check className="w-6 h-6 text-purple-600" />
                                )}
                            </div>

                            {/* Color Swatches */}
                            <div className="flex gap-2 mb-4">
                                <div
                                    className="h-10 flex-1 rounded"
                                    style={{ backgroundColor: theme.colors.primary }}
                                    title="Primary"
                                ></div>
                                <div
                                    className="h-10 flex-1 rounded"
                                    style={{ backgroundColor: theme.colors.secondary }}
                                    title="Secondary"
                                ></div>
                                <div
                                    className="h-10 flex-1 rounded"
                                    style={{ backgroundColor: theme.colors.accent }}
                                    title="Accent"
                                ></div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-600 mb-4">{theme.description}</p>

                            {/* Dark Mode Badge */}
                            {theme.isDark && (
                                <span className="inline-block px-3 py-1 bg-slate-800 text-white text-xs rounded-full mb-4">
                                    🌙 Dark Mode
                                </span>
                            )}

                            {/* Apply Button */}
                            {!isActive && (
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleApplyTheme(id);
                                    }}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                >
                                    <Palette className="w-4 h-4 mr-2" />
                                    Áp dụng Theme
                                </Button>
                            )}
                            {isActive && (
                                <Button
                                    disabled
                                    className="w-full bg-purple-100 text-purple-700 cursor-default"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Đang sử dụng
                                </Button>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Info Section */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    Hướng dẫn Theme System
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                    <li>✓ Click vào theme bất kỳ và nhấn <strong>"Áp dụng Theme"</strong></li>
                    <li>✓ Theme sẽ thay đổi <strong>TOÀN BỘ</strong> màu sắc website ngay lập tức</li>
                    <li>✓ Bao gồm: Header, Banner, Button, Card, Footer và tất cả components</li>
                    <li>✓ Theme được <strong>tự động lưu</strong> vào localStorage</li>
                    <li>✓ Website sẽ giữ nguyên theme ngay cả khi reload trang</li>
                    <li>✓ Theme Dark Mode (Halloween, Black Friday) sẽ thay đổi cả background tối</li>
                    <li>
                        💡 <strong>Tip:</strong> Phối hợp theme với banner cùng dịp lễ để có trải nghiệm tốt nhất!
                    </li>
                </ul>
            </Card>
        </div>
    );
}
