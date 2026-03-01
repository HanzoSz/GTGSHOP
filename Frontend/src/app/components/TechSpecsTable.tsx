import { useMemo } from 'react';
import { Cpu, MemoryStick, HardDrive, Monitor, Zap, Fan, Gamepad2, Keyboard, Mouse, Info } from 'lucide-react';

// ===================== KEY MAPPING (English → Vietnamese) =====================
const KEY_LABELS: Record<string, string> = {
    // CPU
    Socket: 'Socket',
    Cores: 'Số nhân',
    Threads: 'Số luồng',
    BaseClock: 'Xung nhịp cơ bản',
    BoostClock: 'Xung nhịp Boost',
    Cache: 'Bộ nhớ đệm',
    TDP: 'Công suất tiêu thụ (TDP)',
    SupportedRams: 'Chuẩn RAM hỗ trợ',
    IntegratedGraphics: 'Đồ họa tích hợp',
    Architecture: 'Kiến trúc',
    Process: 'Tiến trình',
    Generation: 'Thế hệ',

    // VGA / GPU
    Chipset: 'Chipset',
    VRAM: 'Dung lượng VRAM',
    MemoryBus: 'Bus bộ nhớ',
    RecommendPSU: 'Nguồn khuyến nghị',
    Outputs: 'Cổng xuất hình',
    CudaCores: 'CUDA Cores',
    StreamProcessors: 'Stream Processors',
    BoostClockGPU: 'Xung nhịp Boost GPU',
    Length: 'Chiều dài card',
    Fans: 'Số quạt',

    // Mainboard
    FormFactor: 'Form Factor',
    Chipsets: 'Chipset',
    MemorySlots: 'Số khe RAM',
    MaxMemory: 'RAM tối đa',
    M2Slots: 'Số khe M.2',
    SATAPorts: 'Cổng SATA',
    PCIeSlots: 'Khe PCIe',
    USBPorts: 'Cổng USB',
    Wifi: 'Wifi tích hợp',
    Bluetooth: 'Bluetooth',
    AudioCodec: 'Audio Codec',
    LAN: 'Cổng mạng LAN',

    // RAM
    Type: 'Loại',
    Capacity: 'Dung lượng',
    Speed: 'Tốc độ',
    Latency: 'Độ trễ (CAS)',
    Voltage: 'Điện áp',
    Kit: 'Bộ kit',
    RGB: 'LED RGB',
    Modules: 'Số thanh',
    Profile: 'XMP/EXPO',

    // SSD / HDD
    Interface: 'Giao tiếp',
    ReadSpeed: 'Tốc độ đọc',
    WriteSpeed: 'Tốc độ ghi',
    NAND: 'Loại NAND',
    Endurance: 'Độ bền (TBW)',
    RPM: 'Tốc độ quay',

    // PSU
    Wattage: 'Công suất',
    Efficiency: 'Hiệu suất',
    Modular: 'Modular',
    Certification: 'Chứng nhận 80 Plus',
    FanSize: 'Kích thước quạt',
    Connectors: 'Đầu nối',
    ProtectionFeatures: 'Bảo vệ',

    // Case
    Size: 'Kích thước',
    SupportedFormFactors: 'Hỗ trợ Mainboard',
    MaxGPULength: 'VGA tối đa',
    MaxCPUCoolerHeight: 'Tản nhiệt CPU tối đa',
    DriveBays: 'Khay ổ cứng',
    FanSlots: 'Vị trí gắn quạt',
    PreInstalledFans: 'Quạt sẵn có',
    Material: 'Chất liệu',
    SidePanel: 'Panel bên',
    Weight: 'Trọng lượng',
    Color: 'Màu sắc',

    // Cooler / Tản nhiệt
    CoolerType: 'Loại tản nhiệt',
    SupportedSockets: 'Socket hỗ trợ',
    HeatPipes: 'Số ống đồng',
    RadiatorSize: 'Kích thước Radiator',
    NoiseLevel: 'Độ ồn',

    // Monitor
    ScreenSize: 'Kích thước màn hình',
    Resolution: 'Độ phân giải',
    PanelType: 'Loại tấm nền',
    RefreshRate: 'Tần số quét',
    ResponseTime: 'Thời gian phản hồi',
    Brightness: 'Độ sáng',
    ColorGamut: 'Gam màu',
    HDR: 'Hỗ trợ HDR',
    AdaptiveSync: 'Adaptive Sync',
    Ports: 'Cổng kết nối',
    Curved: 'Màn cong',
    AspectRatio: 'Tỉ lệ khung hình',
    Stand: 'Chân đế',

    // Keyboard
    SwitchType: 'Loại switch',
    Layout: 'Layout',
    Backlight: 'Đèn nền',
    Connection: 'Kết nối',
    Keycaps: 'Keycap',
    HotSwap: 'Hot-Swap',
    Battery: 'Pin',
    PollingRate: 'Polling Rate',
    AntiGhosting: 'Anti-Ghosting',
    NKeyRollover: 'N-Key Rollover',

    // Mouse
    Sensor: 'Cảm biến',
    DPI: 'DPI',
    Buttons: 'Số nút',
    SwitchMouse: 'Switch chuột',
    CableType: 'Loại dây',

    // Headset / Tai nghe
    DriverSize: 'Kích thước driver',
    FrequencyResponse: 'Đáp ứng tần số',
    Impedance: 'Trở kháng',
    Microphone: 'Microphone',
    Surround: 'Âm thanh vòm',

    // Chung
    Brand: 'Thương hiệu',
    Model: 'Model',
    Warranty: 'Bảo hành',
    Origin: 'Xuất xứ',
    MadeIn: 'Sản xuất tại',
    Dimensions: 'Kích thước',
};

// ===================== CATEGORY ICONS =====================
const CATEGORY_ICONS: Record<number, { icon: React.ReactNode; label: string }> = {
    1: { icon: <Cpu className="w-5 h-5" />, label: 'CPU - Bộ vi xử lý' },
    2: { icon: <Gamepad2 className="w-5 h-5" />, label: 'VGA - Card đồ họa' },
    3: { icon: <HardDrive className="w-5 h-5" />, label: 'Mainboard' },
    4: { icon: <MemoryStick className="w-5 h-5" />, label: 'RAM' },
    5: { icon: <HardDrive className="w-5 h-5" />, label: 'SSD / HDD' },
    6: { icon: <Zap className="w-5 h-5" />, label: 'Nguồn PSU' },
    7: { icon: <HardDrive className="w-5 h-5" />, label: 'Case - Vỏ máy tính' },
    8: { icon: <Fan className="w-5 h-5" />, label: 'Tản nhiệt' },
    9: { icon: <Monitor className="w-5 h-5" />, label: 'Màn hình' },
    10: { icon: <Keyboard className="w-5 h-5" />, label: 'Bàn phím' },
    11: { icon: <Mouse className="w-5 h-5" />, label: 'Chuột' },
};

// ===================== SAFE JSON PARSER =====================
function parseTechSpecs(techSpecs: string | null | undefined): Record<string, unknown> | null {
    if (!techSpecs) return null;
    try {
        const parsed = JSON.parse(techSpecs);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return parsed as Record<string, unknown>;
        }
        return null;
    } catch {
        console.warn('Failed to parse TechSpecs JSON:', techSpecs);
        return null;
    }
}

// ===================== FORMAT VALUE =====================
function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    if (typeof value === 'number') {
        // Format numbers with units if they look like wattage/speed
        return value.toLocaleString('vi-VN');
    }
    if (Array.isArray(value)) {
        return value.map(v => String(v)).join(', ');
    }
    return String(value);
}

// ===================== GET LABEL =====================
function getLabel(key: string): string {
    if (KEY_LABELS[key]) return KEY_LABELS[key];
    // Convert camelCase/PascalCase to readable: "BaseClock" → "Base Clock"
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

// ===================== COMPONENT =====================
interface TechSpecsTableProps {
    techSpecs: string | null | undefined;
    categoryId?: number;
    productName?: string;
}

export function TechSpecsTable({ techSpecs, categoryId, productName }: TechSpecsTableProps) {
    const specs = useMemo(() => parseTechSpecs(techSpecs), [techSpecs]);

    if (!specs || Object.keys(specs).length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có thông số kỹ thuật cho sản phẩm này.</p>
            </div>
        );
    }

    const entries = Object.entries(specs);
    const categoryInfo = categoryId ? CATEGORY_ICONS[categoryId] : null;

    return (
        <div>
            {/* Category Header */}
            {categoryInfo && (
                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-red-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        {categoryInfo.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{categoryInfo.label}</h3>
                        {productName && <p className="text-sm text-gray-500 line-clamp-1">{productName}</p>}
                    </div>
                </div>
            )}

            {/* Specs Table */}
            <div className="rounded-xl overflow-hidden border border-gray-200">
                <table className="w-full border-collapse">
                    <tbody>
                        {entries.map(([key, value], index) => (
                            <tr
                                key={key}
                                className={`border-b border-gray-100 last:border-b-0 transition-colors hover:bg-red-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'
                                    }`}
                            >
                                <td className="py-3.5 px-5 font-semibold text-gray-700 w-2/5 text-sm">
                                    {getLabel(key)}
                                </td>
                                <td className="py-3.5 px-5 text-gray-900 text-sm">
                                    {formatValue(value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-400 mt-3 italic">
                * Thông số có thể thay đổi theo lô sản xuất. Vui lòng liên hệ shop để xác nhận.
            </p>
        </div>
    );
}
