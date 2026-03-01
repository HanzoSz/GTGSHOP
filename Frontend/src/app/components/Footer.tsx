import { Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm mb-4">
              Cửa hàng linh kiện PC chính hãng - Chuyên tư vấn build PC Gaming, Văn phòng, Đồ họa với công nghệ AI chatbot thông minh.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center theme-footer-hover transition-colors">
                <span>f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center theme-footer-hover transition-colors">
                <span>in</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center theme-footer-hover transition-colors">
                <span>yt</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Về GTG Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="theme-link-hover">Giới thiệu công ty</a></li>
              <li><a href="#" className="theme-link-hover">Hệ thống cửa hàng</a></li>
              <li><a href="#" className="theme-link-hover">Chính sách bảo mật</a></li>
              <li><a href="#" className="theme-link-hover">Điều khoản sử dụng</a></li>
              <li><a href="#" className="theme-link-hover">Chính sách bảo hành</a></li>
              <li><a href="#" className="theme-link-hover">Hướng dẫn Build PC</a></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white mb-4">Dịch vụ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="theme-link-hover">Tư vấn Build PC AI</a></li>
              <li><a href="#" className="theme-link-hover">Hướng dẫn lắp ráp PC</a></li>
              <li><a href="#" className="theme-link-hover">Dịch vụ nâng cấp PC</a></li>
              <li><a href="#" className="theme-link-hover">Sửa chữa máy tính</a></li>
              <li><a href="#" className="theme-link-hover">Tra cứu bảo hành</a></li>
              <li><a href="#" className="theme-link-hover">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 theme-icon" />
                <span>123 Đường Láng, Đống Đa, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0 theme-icon" />
                <span>Hotline: 0901 234 567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0 theme-icon" />
                <span>support@gtgshop.vn</span>
              </li>
            </ul>
            <div className="mt-4 p-4 theme-footer-box rounded-lg border">
              <h4 className="theme-footer-box-title mb-2 text-sm font-bold">🏮 Giờ làm việc</h4>
              <p className="text-sm">Mùng 1-3: 9:00 - 18:00</p>
              <p className="text-sm font-bold text-red-300">Ngày thường: 8:00 - 22:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2025 GTG Computer Shop. Chúc Quý khách năm mới an khang thịnh vượng 🏮</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-red-400">Chính sách bảo mật</a>
              <a href="#" className="hover:text-red-400">Điều khoản</a>
              <a href="#" className="hover:text-red-400">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}