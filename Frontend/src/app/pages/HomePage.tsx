import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/app/components/Header';
import { TetBanner } from '@/app/components/TetBanner';
import { Hero } from '@/app/components/Hero';
import { CategorySection } from '@/app/components/CategorySection';
import { ProductCard, Product } from '@/app/components/ProductCard';
import { Footer } from '@/app/components/Footer';
import { Chatbot } from '@/app/components/Chatbot';
import { getProducts } from '../../services/api';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data: Product[]) => {
        console.log("Dữ liệu từ API:", data);
        console.log("Sample categoryId:", data[0]?.categoryId, typeof data[0]?.categoryId);
        setProducts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Lọc theo categoryId từ database
  const cpuProducts = products.filter(p => p.categoryId === 1).slice(0, 4);
  const vgaProducts = products.filter(p => p.categoryId === 2).slice(0, 4);
  const mainboardProducts = products.filter(p => p.categoryId === 3).slice(0, 4);
  const ramProducts = products.filter(p => p.categoryId === 4).slice(0, 4);
  const storageProducts = products.filter(p => p.categoryId === 5).slice(0, 4);
  const caseProducts = products.filter(p => p.categoryId === 6).slice(0, 4);

  // Debug log
  console.log("CPU Products:", cpuProducts.length);
  console.log("VGA Products:", vgaProducts.length);

  // Sản phẩm giảm giá thực — lọc từ DB, sắp xếp theo % giảm cao nhất
  const discountedProducts = products
    .filter(p => p.discount && p.discount > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 8);

  // Sản phẩm nổi bật - lấy đa dạng từ các loại (không có giảm giá)
  const featuredProducts = [
    ...cpuProducts.slice(0, 2),
    ...vgaProducts.slice(0, 2),
    ...mainboardProducts.slice(0, 2),
    ...ramProducts.slice(0, 1),
    ...storageProducts.slice(0, 1),
  ].slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <TetBanner />
      <Hero />
      <CategorySection />

      {/* 🔥 Sản phẩm giảm giá */}
      {discountedProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">🔥 Sản phẩm giảm giá</h2>
                <p className="text-gray-600">Săn deal hot — Giảm tới {Math.max(...discountedProducts.map(p => p.discount || 0))}%</p>
              </div>
              <Link to="/sale" className="text-red-600 hover:underline font-medium">
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {discountedProducts.map((product) => (
                <ProductCard key={`deal-${product.id}`} {...product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sản phẩm nổi bật */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">⭐ Sản phẩm nổi bật</h2>
              <p className="text-gray-600">Đa dạng linh kiện PC chính hãng</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Đang tải sản phẩm...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có sản phẩm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Build PC Packages */}
      <section className="py-12 bg-gradient-to-br from-red-900 via-red-800 to-orange-900 text-white relative overflow-hidden">
        {/* Decorative Tet elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🏮</div>
          <div className="absolute top-20 right-10 text-8xl">🧧</div>
          <div className="absolute bottom-10 left-1/4 text-9xl">🌸</div>
          <div className="absolute bottom-10 right-1/4 text-8xl">🎆</div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block bg-yellow-400 text-red-900 px-6 py-2 rounded-full mb-4 font-bold">
              🎊 DEAL TẾT ĐẶC BIỆT 2025
            </div>
            <h2 className="text-white mb-3">🎮 Bộ PC Build Sẵn - Rinh Về Ăn Tết</h2>
            <p className="text-yellow-200 text-lg">Cấu hình được tối ưu sẵn - Freeship toàn quốc - Bảo hành 36 tháng</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-400 hover:bg-white/15 transition-all hover:scale-105">
              <div className="text-center mb-4">
                <div className="inline-block bg-green-500 px-4 py-2 rounded-full mb-3">
                  <span className="font-bold">GAMING BASIC</span>
                </div>
                <h3 className="text-white text-3xl mb-2 font-bold">15 Triệu</h3>
                <p className="text-yellow-300 text-sm font-semibold">⚡ Giảm 3 triệu - Chơi mượt 1080p</p>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ Intel i5-12400F</li>
                <li>✓ RTX 3050 8GB</li>
                <li>✓ 16GB RAM DDR4</li>
                <li>✓ SSD 500GB NVMe</li>
                <li>✓ B660M Mainboard</li>
              </ul>
              <div className="mb-4 p-3 bg-yellow-400/20 rounded-lg border border-yellow-400">
                <p className="text-xs text-yellow-200">🎁 Tặng: Chuột + Bàn phím Gaming</p>
              </div>
              <button className="w-full bg-white text-green-600 py-3 rounded-lg font-bold hover:bg-yellow-400 hover:text-red-900 transition-colors">
                🛒 Đặt mua ngay
              </button>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 border-4 border-yellow-300 shadow-2xl transform scale-110 hover:scale-115 transition-all">
              <div className="text-center mb-4">
                <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full mb-3 font-bold animate-pulse">
                  🔥 BÁN CHẠY NHẤT - GIẢM 50%
                </div>
                <h3 className="text-red-900 text-3xl mb-2 font-bold">25 Triệu</h3>
                <p className="text-red-800 text-sm font-bold">🎊 Tiết kiệm 12 triệu - Siêu mượt 1440p</p>
              </div>
              <ul className="space-y-2 text-sm mb-6 text-red-900 font-medium">
                <li>✓ AMD Ryzen 7 5700X</li>
                <li>✓ RTX 4060 Ti 8GB</li>
                <li>✓ 32GB RAM DDR4</li>
                <li>✓ SSD 1TB NVMe Gen4</li>
                <li>✓ B550 Mainboard</li>
              </ul>
              <div className="mb-4 p-3 bg-red-900 rounded-lg border-2 border-yellow-300">
                <p className="text-xs text-yellow-200 font-bold">🎁 Tặng: Tai nghe + Webcam + Phần mềm</p>
              </div>
              <button className="w-full bg-red-900 text-yellow-300 py-3 rounded-lg font-bold hover:bg-red-800 transition-colors shadow-lg">
                🏮 MUA NGAY - QUÀ HOT
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-400 hover:bg-white/15 transition-all hover:scale-105">
              <div className="text-center mb-4">
                <div className="inline-block bg-purple-500 px-4 py-2 rounded-full mb-3">
                  <span className="font-bold">GAMING PRO</span>
                </div>
                <h3 className="text-white text-3xl mb-2 font-bold">40 Triệu</h3>
                <p className="text-purple-300 text-sm font-semibold">💎 Giảm 8 triệu - Chiến 4K Ultra</p>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ Intel i7-13700K</li>
                <li>✓ RTX 4070 Ti 12GB</li>
                <li>✓ 32GB RAM DDR5</li>
                <li>✓ SSD 2TB NVMe Gen4</li>
                <li>✓ Z790 Mainboard</li>
              </ul>
              <div className="mb-4 p-3 bg-purple-500/20 rounded-lg border border-purple-400">
                <p className="text-xs text-purple-200">🎁 Tặng: Màn hình 144Hz + Ghế Gaming</p>
              </div>
              <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-bold hover:bg-purple-400 hover:text-white transition-colors">
                ⚡ Đặt hàng ngay
              </button>
            </div>
          </div>

          {/* Additional Tet promotion banner */}
          <div className="mt-12 bg-yellow-400 text-red-900 rounded-2xl p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">🧧 LÌ XÌ ĐẦU NĂM - TẶNG THÊM 500K 🧧</h3>
            <p className="text-lg">Cho mỗi đơn hàng từ 20 triệu - Áp dụng đến hết 15 Tết Nguyên Đán</p>
          </div>
        </div>
      </section>

      {/* CPU Section */}
      <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="mb-2">🖥️ CPU - Bộ vi xử lý</h2>
              <p className="text-gray-600">Intel & AMD - Sale Tết giảm sốc</p>
            </div>
            <Link to="/category/cpu" className="text-red-600 hover:underline font-medium">
              Xem tất cả CPU 🏮 →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {cpuProducts.map((product) => (
              <ProductCard key={`cpu-${product.id}`} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* VGA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="mb-2">🎮 VGA - Card đồ họa</h2>
              <p className="text-gray-600">NVIDIA & AMD Gaming - Giá Tết cực sốc</p>
            </div>
            <Link to="/category/vga" className="text-red-600 hover:underline font-medium">
              Xem tất cả VGA 🧨 →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {vgaProducts.map((product) => (
              <ProductCard key={`vga-${product.id}`} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Mainboard Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="mb-2">🔌 Mainboard - Bo mạch chủ</h2>
              <p className="text-gray-600">ASUS, MSI, Gigabyte - Chính hãng giá tốt</p>
            </div>
            <Link to="/category/mainboard" className="text-blue-600 hover:underline font-medium">
              Xem tất cả Mainboard →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {mainboardProducts.map((product) => (
              <ProductCard key={`mb-${product.id}`} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* RAM Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="mb-2">💾 RAM - Bộ nhớ trong</h2>
              <p className="text-gray-600">DDR4 & DDR5 - Corsair, G.Skill, Kingston</p>
            </div>
            <Link to="/category/ram" className="text-green-600 hover:underline font-medium">
              Xem tất cả RAM →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {ramProducts.map((product) => (
              <ProductCard key={`ram-${product.id}`} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Storage Section */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="mb-2">💿 SSD/HDD - Ổ cứng</h2>
              <p className="text-gray-600">Samsung, WD, Crucial - Tốc độ NVMe Gen4</p>
            </div>
            <Link to="/category/ssd" className="text-purple-600 hover:underline font-medium">
              Xem tất cả SSD/HDD →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {storageProducts.map((product) => (
              <ProductCard key={`storage-${product.id}`} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Case Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="mb-2">🖥️ Case - Vỏ máy tính</h2>
              <p className="text-gray-600">NZXT, Lian Li, Corsair - Thiết kế đẹp mắt</p>
            </div>
            <Link to="/category/case" className="text-orange-600 hover:underline font-medium">
              Xem tất cả Case →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {caseProducts.map((product) => (
              <ProductCard key={`case-${product.id}`} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section và Trust Badges giữ nguyên */}
      {/* ...existing code... */}

      <Footer />
      <Chatbot />
    </div>
  );
}
