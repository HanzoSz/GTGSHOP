import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-orange-600 text-white py-12 md:py-16">
      {/* Decorative Tet elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 text-8xl animate-pulse">🌸</div>
        <div className="absolute top-20 right-20 text-6xl animate-bounce">🏮</div>
        <div className="absolute bottom-10 left-1/4 text-7xl animate-pulse" style={{ animationDelay: '0.5s' }}>🧧</div>
        <div className="absolute bottom-20 right-1/4 text-6xl animate-bounce" style={{ animationDelay: '1s' }}>🎆</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-900 px-4 py-2 rounded-full mb-4 animate-pulse">
              <span className="font-bold text-lg">🧨 SALE TẾT NGUYÊN ĐÁN 2025</span>
            </div>
            <h1 className="text-4xl md:text-6xl mb-4 font-bold">
              Đón Tết - Rinh Ngay PC Gaming 🎮
            </h1>
            <p className="text-xl mb-2 text-yellow-100">
              ⚡ Giảm sốc đến 50% linh kiện PC cao cấp
            </p>
            <p className="text-lg mb-6 text-yellow-100">
              🎁 Tặng kèm: Phần mềm bản quyền + Tản nhiệt + Balo Gaming
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-yellow-400 text-red-900 hover:bg-yellow-300 font-bold shadow-lg">
                🏮 Xem Deal Tết
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-red-600 font-bold">
                🎁 Nhận Voucher
              </Button>
            </div>
            
            {/* Countdown timer */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-yellow-300 font-bold">⏰ Sale kết thúc trong:</span>
              <div className="flex gap-2">
                <div className="bg-white text-red-600 px-3 py-2 rounded-lg font-bold shadow-lg">
                  <div className="text-2xl">12</div>
                  <div className="text-xs">Ngày</div>
                </div>
                <div className="bg-white text-red-600 px-3 py-2 rounded-lg font-bold shadow-lg">
                  <div className="text-2xl">05</div>
                  <div className="text-xs">Giờ</div>
                </div>
                <div className="bg-white text-red-600 px-3 py-2 rounded-lg font-bold shadow-lg">
                  <div className="text-2xl">30</div>
                  <div className="text-xs">Phút</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-yellow-400">
                <div className="text-4xl mb-2">🎮</div>
                <h3 className="mb-2 font-bold">PC Gaming</h3>
                <p className="text-sm text-yellow-100">Giảm đến 40%</p>
                <div className="mt-2 bg-yellow-400 text-red-900 px-2 py-1 rounded text-xs font-bold inline-block">
                  HOT 🔥
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-yellow-400">
                <div className="text-4xl mb-2">💼</div>
                <h3 className="mb-2 font-bold">PC Văn phòng</h3>
                <p className="text-sm text-yellow-100">Từ 5 triệu</p>
                <div className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                  NEW
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-yellow-400">
                <div className="text-4xl mb-2">🎨</div>
                <h3 className="mb-2 font-bold">PC Đồ họa</h3>
                <p className="text-sm text-yellow-100">Tặng màn hình</p>
                <div className="mt-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                  GIFT 🎁
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border-2 border-yellow-400">
                <div className="text-4xl mb-2">🔧</div>
                <h3 className="mb-2 font-bold">Nâng cấp PC</h3>
                <p className="text-sm text-yellow-100">Tư vấn AI miễn phí</p>
                <div className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                  FREE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Firework effect */}
      <div className="absolute top-10 right-10 animate-ping text-4xl">✨</div>
      <div className="absolute bottom-10 left-10 animate-ping text-4xl" style={{ animationDelay: '0.5s' }}>✨</div>
    </section>
  );
}