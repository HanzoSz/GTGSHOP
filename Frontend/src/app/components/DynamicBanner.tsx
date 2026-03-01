import { useEffect, useState } from 'react';
import { Button } from './ui/button';

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
}

export function DynamicBanner() {
    const [banner, setBanner] = useState<BannerConfig | null>(null);

    useEffect(() => {
        // Load banner từ localStorage
        const savedBanner = localStorage.getItem('activeBanner');
        if (savedBanner) {
            try {
                setBanner(JSON.parse(savedBanner));
            } catch (error) {
                console.error('Error loading banner:', error);
                // Fallback to default Tet banner
                setBanner(getDefaultBanner());
            }
        } else {
            // Set default banner nếu chưa có
            setBanner(getDefaultBanner());
        }

        // Listen for banner changes
        const handleBannerChange = (e: CustomEvent) => {
            setBanner(e.detail);
        };

        window.addEventListener('bannerChanged' as any, handleBannerChange);

        return () => {
            window.removeEventListener('bannerChanged' as any, handleBannerChange);
        };
    }, []);

    const getDefaultBanner = (): BannerConfig => {
        return {
            id: 'tet',
            name: 'Tết Nguyên Đán 2026',
            title: '🎊 SALE TẾT 2026 - GIẢM ĐẾN 50% 🎊',
            description: 'Săn deal HOT linh kiện PC - Rinh quà khủng đón Tết',
            bgGradient: 'from-red-600 via-orange-500 to-yellow-500',
            textColor: 'text-white',
            buttonText: 'MUA NGAY',
            icon: '🧧',
            isActive: true,
        };
    };

    if (!banner) return null;

    return (
        <section className={`relative py-16 px-4 bg-gradient-to-r ${banner.bgGradient} overflow-hidden`}>
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32"></div>
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full"></div>

            {/* Decorative Icons */}
            <div className="absolute top-8 left-8 text-6xl opacity-20 animate-bounce">{banner.icon}</div>
            <div className="absolute top-8 right-8 text-6xl opacity-20 animate-bounce delay-100">{banner.icon}</div>
            <div className="absolute bottom-8 left-1/4 text-5xl opacity-20 animate-pulse">{banner.icon}</div>
            <div className="absolute bottom-8 right-1/4 text-5xl opacity-20 animate-pulse delay-150">{banner.icon}</div>

            <div className="container mx-auto relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className={`text-5xl md:text-6xl font-black ${banner.textColor} mb-6 drop-shadow-lg animate-pulse`}>
                        {banner.title}
                    </h1>
                    <p className={`text-xl md:text-2xl ${banner.textColor} mb-8 font-semibold drop-shadow-md`}>
                        {banner.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            size="lg"
                            className="bg-white hover:bg-gray-100 text-slate-900 font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:scale-105 transition-transform"
                        >
                            {banner.buttonText}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className={`${banner.textColor} border-2 border-white hover:bg-white/20 font-bold text-lg px-8 py-6 rounded-xl backdrop-blur-sm`}
                        >
                            Xem thêm ưu đãi
                        </Button>
                    </div>
                </div>

                {/* Countdown Timer (Optional) */}
                <div className={`mt-10 text-center ${banner.textColor}`}>
                    <p className="text-sm font-semibold mb-3 opacity-90">⏰ Ưu đãi có thời hạn</p>
                    <div className="flex gap-4 justify-center">
                        {[
                            { label: 'Ngày', value: '15' },
                            { label: 'Giờ', value: '08' },
                            { label: 'Phút', value: '45' },
                            { label: 'Giây', value: '30' },
                        ].map((item, index) => (
                            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[80px]">
                                <div className="text-3xl font-black">{item.value}</div>
                                <div className="text-xs font-semibold opacity-90">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}