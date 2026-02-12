export function TetBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 relative z-10">
          <span className="text-2xl animate-bounce">🏮</span>
          <div className="text-center">
            <p className="text-sm md:text-base font-bold animate-pulse">
              🎊 CHÚC MỪNG NĂM MỚI 2025 - ƯU ĐÃI TẾT LÊN ĐẾN 50% 🎊
            </p>
            <p className="text-xs md:text-sm text-yellow-200 mt-1">
              Freeship toàn quốc • Tặng quà may mắn • Bảo hành 36 tháng
            </p>
          </div>
          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🏮</span>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-1/2 left-10 text-6xl -translate-y-1/2 animate-pulse">🧧</div>
        <div className="absolute top-1/2 right-10 text-6xl -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}>🧧</div>
      </div>
    </section>
  );
}
