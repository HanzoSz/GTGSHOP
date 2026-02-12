import { Link } from 'react-router-dom';
import { 
  Cpu, 
  MonitorPlay, 
  CircuitBoard, 
  MemoryStick, 
  HardDrive, 
  PcCase, 
  Power, 
  Fan 
} from 'lucide-react';

const categories = [
  { name: 'CPU', slug: 'cpu', icon: Cpu, desc: 'Bộ vi xử lý' },
  { name: 'VGA', slug: 'vga', icon: MonitorPlay, desc: 'Card đồ họa' },
  { name: 'RAM', slug: 'ram', icon: MemoryStick, desc: 'Bộ nhớ' },
  { name: 'Mainboard', slug: 'mainboard', icon: CircuitBoard, desc: 'Bo mạch chủ' },
  { name: 'SSD/HDD', slug: 'ssd', icon: HardDrive, desc: 'Ổ cứng' },
  { name: 'Case', slug: 'case', icon: PcCase, desc: 'Vỏ máy tính' },
  { name: 'PSU', slug: 'psu', icon: Power, desc: 'Nguồn máy tính' },
  { name: 'Cooling', slug: 'cooling', icon: Fan, desc: 'Tản nhiệt' },
];

export function CategorySection() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Danh mục linh kiện PC</h2>
          <Link to="/category/all" className="text-red-600 hover:underline text-sm">
            Xem tất cả →
          </Link>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center p-4 rounded-xl hover:bg-red-50 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-red-100 transition-colors">
                <cat.icon className="w-6 h-6 text-gray-600 group-hover:text-red-600" />
              </div>
              <span className="font-medium text-sm text-center">{cat.name}</span>
              <span className="text-xs text-gray-500">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}