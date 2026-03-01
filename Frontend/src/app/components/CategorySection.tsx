import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  MonitorPlay,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  PcCase,
  Power,
  Fan,
  Mouse,
  Keyboard,
  Monitor,
  LucideIcon,
  Package
} from 'lucide-react';
import { getCategories, Category } from '../../services/api';

// Map tên category → icon tương ứng
const categoryIconMap: Record<string, LucideIcon> = {
  'CPU - Bộ vi xử lý': Cpu,
  'VGA - Card đồ họa': MonitorPlay,
  'Mainboard': CircuitBoard,
  'RAM': MemoryStick,
  'SSD/HDD': HardDrive,
  'Case PC': PcCase,
  'Nguồn PSU': Power,
  'Tản nhiệt': Fan,
  'Chuột': Mouse,
  'Bàn phím': Keyboard,
  'Màn hình': Monitor,
};

// Fallback: tìm icon theo keyword trong tên
function getIconForCategory(name: string): LucideIcon {
  // Exact match first
  if (categoryIconMap[name]) return categoryIconMap[name];

  // Keyword match
  const lower = name.toLowerCase();
  if (lower.includes('cpu') || lower.includes('vi xử lý')) return Cpu;
  if (lower.includes('vga') || lower.includes('card')) return MonitorPlay;
  if (lower.includes('mainboard') || lower.includes('bo mạch')) return CircuitBoard;
  if (lower.includes('ram') || lower.includes('bộ nhớ')) return MemoryStick;
  if (lower.includes('ssd') || lower.includes('hdd') || lower.includes('ổ cứng')) return HardDrive;
  if (lower.includes('case') || lower.includes('vỏ')) return PcCase;
  if (lower.includes('nguồn') || lower.includes('psu')) return Power;
  if (lower.includes('tản') || lower.includes('cooling') || lower.includes('fan')) return Fan;
  if (lower.includes('chuột') || lower.includes('mouse')) return Mouse;
  if (lower.includes('bàn phím') || lower.includes('keyboard')) return Keyboard;
  if (lower.includes('màn hình') || lower.includes('monitor')) return Monitor;

  return Package; // Default fallback icon
}

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Danh mục linh kiện PC</h2>
          <Link to="/category/all" className="text-red-600 hover:underline text-sm">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-4">
          {categories.map((cat) => {
            const Icon = getIconForCategory(cat.name);
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="flex flex-col items-center p-4 rounded-xl hover:bg-red-50 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-red-100 transition-colors">
                  <Icon className="w-6 h-6 text-gray-600 group-hover:text-red-600" />
                </div>
                <span className="font-medium text-sm text-center">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}