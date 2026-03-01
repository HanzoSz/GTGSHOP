import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';

// =====================================================
// HERO CONTENT PER THEME
// =====================================================
interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  gift: string;
  buttonPrimary: string;
  buttonSecondary: string;
  decorations: string[];
  gradient: string;
  badgeBg: string;
  badgeText: string;
  countdownLabel: string;
}

const HERO_CONTENT: Record<string, HeroContent> = {
  tet: {
    badge: '🧨 SALE TẾT NGUYÊN ĐÁN 2026',
    title: 'Đón Tết - Rinh Ngay PC Gaming 🎮',
    subtitle: '⚡ Giảm sốc đến 50% linh kiện PC cao cấp',
    gift: '🎁 Tặng kèm: Phần mềm bản quyền + Tản nhiệt + Balo Gaming',
    buttonPrimary: '🏮 Xem Deal Tết',
    buttonSecondary: '🎁 Nhận Voucher',
    decorations: ['🌸', '🏮', '🧧', '🎆'],
    gradient: 'from-red-700 via-red-600 to-orange-600',
    badgeBg: 'bg-yellow-400 text-red-900',
    badgeText: 'text-yellow-100',
    countdownLabel: '⏰ Sale kết thúc trong:',
  },
  noel: {
    badge: '🎄 GIÁNG SINH AN LÀNH 2026',
    title: 'Đón Giáng Sinh - Deal PC Khủng 🎅',
    subtitle: '⚡ Giảm đến 45% - Quà tặng PC xịn',
    gift: '🎁 Tặng kèm: Chuột Gaming + Tai nghe + Đèn LED',
    buttonPrimary: '🎄 Xem Deal Noel',
    buttonSecondary: '🎅 Nhận Quà',
    decorations: ['🎄', '⛄', '🎅', '❄️'],
    gradient: 'from-red-700 via-green-700 to-red-800',
    badgeBg: 'bg-green-400 text-red-900',
    badgeText: 'text-green-100',
    countdownLabel: '⏰ Ưu đãi Noel kết thúc:',
  },
  halloween: {
    badge: '🎃 HALLOWEEN SALE KINH DỊ',
    title: 'Halloween - Giá Rẻ Đến Sợ 👻',
    subtitle: '💀 Giảm sốc đến 40% - Deal bí ẩn mỗi ngày',
    gift: '🎁 Tặng kèm: Đèn RGB + Sticker Gaming + Case Mod',
    buttonPrimary: '🎃 Deal Bí Ngô',
    buttonSecondary: '👻 Quà Bí Ẩn',
    decorations: ['🎃', '👻', '🦇', '🕸️'],
    gradient: 'from-orange-800 via-purple-900 to-gray-900',
    badgeBg: 'bg-orange-400 text-purple-900',
    badgeText: 'text-orange-200',
    countdownLabel: '🕐 Đếm ngược Halloween:',
  },
  blackfriday: {
    badge: '🏷️ BLACK FRIDAY - GIẢM SỐC',
    title: 'Black Friday - Phá Giá Linh Kiện 🖤',
    subtitle: '🔥 Giảm đến 60% - Flash Sale mỗi giờ',
    gift: '🎁 Tặng kèm: Voucher + Phần mềm + Bảo hành VIP',
    buttonPrimary: '🖤 Mua Ngay',
    buttonSecondary: '🏷️ Flash Sale',
    decorations: ['🏷️', '💰', '🔥', '⚡'],
    gradient: 'from-gray-900 via-gray-800 to-red-900',
    badgeBg: 'bg-red-600 text-white',
    badgeText: 'text-red-200',
    countdownLabel: '⏰ Flash Sale kết thúc:',
  },
  default: {
    badge: '🏪 GTG SHOP - UY TÍN SỐ 1',
    title: 'Linh Kiện PC Chính Hãng 💻',
    subtitle: '⚡ Giá tốt nhất thị trường - Bảo hành lên đến 36 tháng',
    gift: '🎁 Tặng kèm: Tư vấn build PC AI + Lắp đặt miễn phí',
    buttonPrimary: '🛒 Mua Sắm Ngay',
    buttonSecondary: '💬 Tư Vấn AI',
    decorations: ['💻', '🖥️', '⌨️', '🖱️'],
    gradient: 'from-blue-700 via-blue-600 to-purple-700',
    badgeBg: 'bg-blue-400 text-blue-900',
    badgeText: 'text-blue-100',
    countdownLabel: '⏰ Ưu đãi có hạn:',
  },
  custom: {
    badge: '🎨 KHUYẾN MÃI ĐẶC BIỆT',
    title: 'Ưu Đãi Linh Kiện PC 🎮',
    subtitle: '⚡ Giảm giá hấp dẫn - Chỉ có tại GTG Shop',
    gift: '🎁 Tặng kèm: Phụ kiện Gaming + Voucher giảm giá',
    buttonPrimary: '🛒 Xem Deal',
    buttonSecondary: '🎁 Nhận Quà',
    decorations: ['🎮', '💻', '🖥️', '⚡'],
    gradient: 'from-red-700 via-red-600 to-orange-600',
    badgeBg: 'bg-yellow-400 text-red-900',
    badgeText: 'text-yellow-100',
    countdownLabel: '⏰ Ưu đãi kết thúc:',
  },
};

export function Hero() {
  const { themeId } = useTheme();
  const content = HERO_CONTENT[themeId] || HERO_CONTENT.default;

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${content.gradient} text-white py-12 md:py-16`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 text-8xl animate-pulse">{content.decorations[0]}</div>
        <div className="absolute top-20 right-20 text-6xl animate-bounce">{content.decorations[1]}</div>
        <div className="absolute bottom-10 left-1/4 text-7xl animate-pulse" style={{ animationDelay: '0.5s' }}>{content.decorations[2]}</div>
        <div className="absolute bottom-20 right-1/4 text-6xl animate-bounce" style={{ animationDelay: '1s' }}>{content.decorations[3]}</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 ${content.badgeBg} px-4 py-2 rounded-full mb-4 animate-pulse`}>
              <span className="font-bold text-lg">{content.badge}</span>
            </div>
            <h1 className="text-4xl md:text-6xl mb-4 font-bold">
              {content.title}
            </h1>
            <p className={`text-xl mb-2 ${content.badgeText}`}>
              {content.subtitle}
            </p>
            <p className={`text-lg mb-6 ${content.badgeText}`}>
              {content.gift}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className={`${content.badgeBg} font-bold shadow-lg`}>
                {content.buttonPrimary}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-800 font-bold">
                {content.buttonSecondary}
              </Button>
            </div>

            {/* Countdown timer */}
            <div className="mt-8 flex items-center gap-4">
              <span className={`${content.badgeText} font-bold`}>{content.countdownLabel}</span>
              <div className="flex gap-2">
                {[
                  { value: '12', label: 'Ngày' },
                  { value: '05', label: 'Giờ' },
                  { value: '30', label: 'Phút' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg font-bold shadow-lg text-center">
                    <div className="text-2xl">{item.value}</div>
                    <div className="text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-white/30">
                <div className="text-4xl mb-2">🎮</div>
                <h3 className="mb-2 font-bold">PC Gaming</h3>
                <p className={`text-sm ${content.badgeText}`}>Giảm đến 40%</p>
                <div className="mt-2 bg-yellow-400 text-red-900 px-2 py-1 rounded text-xs font-bold inline-block">
                  HOT 🔥
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-white/30">
                <div className="text-4xl mb-2">💼</div>
                <h3 className="mb-2 font-bold">PC Văn phòng</h3>
                <p className={`text-sm ${content.badgeText}`}>Từ 5 triệu</p>
                <div className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                  NEW
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-white/30">
                <div className="text-4xl mb-2">🎨</div>
                <h3 className="mb-2 font-bold">PC Đồ họa</h3>
                <p className={`text-sm ${content.badgeText}`}>Tặng màn hình</p>
                <div className="mt-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                  GIFT 🎁
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-white/30">
                <div className="text-4xl mb-2">🔧</div>
                <h3 className="mb-2 font-bold">Nâng cấp PC</h3>
                <p className={`text-sm ${content.badgeText}`}>Tư vấn AI miễn phí</p>
                <div className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                  FREE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute top-10 right-10 animate-ping text-4xl">✨</div>
      <div className="absolute bottom-10 left-10 animate-ping text-4xl" style={{ animationDelay: '0.5s' }}>✨</div>
    </section>
  );
}