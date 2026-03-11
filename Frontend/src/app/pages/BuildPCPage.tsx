import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API_URL, IMAGE_BASE_URL } from '@/config';
import {
    Cpu, Monitor, HardDrive, Zap, Fan, Box, MemoryStick,
    Plus, X, Search, ShoppingCart, AlertTriangle, CheckCircle,
    ChevronRight, Loader2, RotateCcw, Gamepad2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../context/CartContext';

// ===================== INTERFACES =====================
interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    stock: number;
    categoryId: number;
    categoryName?: string;
    techSpecs: string | null;
    discount?: number;
}

interface ParsedSpecs {
    Socket?: string;
    SupportedRams?: string[];
    TDP?: number;
    RamType?: string;
    FormFactor?: string;
    Type?: string;
    Length?: number;
    Wattage?: number;
    SupportedMainboards?: string[];
    MaxVGALength?: number;
    [key: string]: unknown;
}

type ComponentSlot = 'cpu' | 'mainboard' | 'ram' | 'vga' | 'ssd' | 'psu' | 'case' | 'cooler' | 'monitor';

type BuildState = Record<ComponentSlot, Product | null>;

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

interface PowerResult {
    currentDraw: number;
    recommended: number;
    cpuTDP: number;
    vgaTDP: number;
}

// ===================== CONSTANTS =====================

const COMPONENT_SLOTS: { key: ComponentSlot; label: string; categoryId: number; icon: React.ReactNode; required: boolean }[] = [
    { key: 'cpu', label: 'CPU - Bộ vi xử lý', categoryId: 1, icon: <Cpu className="w-5 h-5" />, required: true },
    { key: 'mainboard', label: 'Mainboard', categoryId: 3, icon: <HardDrive className="w-5 h-5" />, required: true },
    { key: 'ram', label: 'RAM', categoryId: 4, icon: <MemoryStick className="w-5 h-5" />, required: true },
    { key: 'vga', label: 'VGA - Card đồ họa', categoryId: 2, icon: <Gamepad2 className="w-5 h-5" />, required: true },
    { key: 'ssd', label: 'Ổ cứng SSD / HDD', categoryId: 5, icon: <HardDrive className="w-5 h-5" />, required: true },
    { key: 'psu', label: 'Nguồn PSU', categoryId: 7, icon: <Zap className="w-5 h-5" />, required: true },
    { key: 'case', label: 'Vỏ Case', categoryId: 6, icon: <Box className="w-5 h-5" />, required: false },
    { key: 'cooler', label: 'Tản nhiệt', categoryId: 8, icon: <Fan className="w-5 h-5" />, required: false },
    { key: 'monitor', label: 'Màn hình', categoryId: 11, icon: <Monitor className="w-5 h-5" />, required: false },
];

// ===================== HELPERS =====================
function parseTechSpecs(techSpecs: string | null | undefined): ParsedSpecs | null {
    if (!techSpecs) return null;
    try {
        return JSON.parse(techSpecs) as ParsedSpecs;
    } catch {
        return null;
    }
}

function getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return 'https://via.placeholder.com/80x80?text=No+Image';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${IMAGE_BASE_URL}${imageUrl}`;
    return `${IMAGE_BASE_URL}/${imageUrl}`;
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getSpecsSummary(specs: ParsedSpecs | null): string {
    if (!specs) return '';
    const parts: string[] = [];
    if (specs.Socket) parts.push(`Socket ${specs.Socket}`);
    if (specs.TDP) parts.push(`${specs.TDP}W TDP`);
    if (specs.SupportedRams) parts.push(specs.SupportedRams.join('/'));
    if (specs.RamType) parts.push(specs.RamType);
    if (specs.FormFactor) parts.push(specs.FormFactor);
    if (specs.Type) parts.push(specs.Type);
    if (specs.Wattage) parts.push(`${specs.Wattage}W`);
    if (specs.Length) parts.push(`${specs.Length}mm`);
    if (specs.MaxVGALength) parts.push(`VGA max ${specs.MaxVGALength}mm`);
    return parts.join(' • ');
}

// ===================== VALIDATION ENGINE =====================
function validateCompatibility(build: BuildState): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const cpuSpecs = parseTechSpecs(build.cpu?.techSpecs);
    const mbSpecs = parseTechSpecs(build.mainboard?.techSpecs);
    const ramSpecs = parseTechSpecs(build.ram?.techSpecs);
    const vgaSpecs = parseTechSpecs(build.vga?.techSpecs);
    const psuSpecs = parseTechSpecs(build.psu?.techSpecs);
    const caseSpecs = parseTechSpecs(build.case?.techSpecs);

    // 1. CPU vs Mainboard: Socket compatibility
    if (cpuSpecs?.Socket && mbSpecs?.Socket) {
        if (cpuSpecs.Socket !== mbSpecs.Socket) {
            errors.push(`❌ CPU Socket ${cpuSpecs.Socket} không tương thích với Mainboard Socket ${mbSpecs.Socket}`);
        }
    }

    // 2. Mainboard vs RAM: Type compatibility
    if (mbSpecs?.RamType && ramSpecs?.Type) {
        if (mbSpecs.RamType !== ramSpecs.Type) {
            errors.push(`❌ Mainboard hỗ trợ ${mbSpecs.RamType} nhưng RAM là ${ramSpecs.Type}`);
        }
    }
    // Also check CPU supported RAMs
    if (cpuSpecs?.SupportedRams && ramSpecs?.Type) {
        if (!cpuSpecs.SupportedRams.includes(ramSpecs.Type)) {
            errors.push(`❌ CPU không hỗ trợ ${ramSpecs.Type} (chỉ hỗ trợ: ${cpuSpecs.SupportedRams.join(', ')})`);
        }
    }

    // 3. Case vs VGA: Length check
    if (caseSpecs?.MaxVGALength && vgaSpecs?.Length) {
        if (vgaSpecs.Length > caseSpecs.MaxVGALength) {
            errors.push(`❌ VGA dài ${vgaSpecs.Length}mm vượt quá Case cho phép ${caseSpecs.MaxVGALength}mm`);
        }
    }

    // 4. Case vs Mainboard: Form factor
    if (caseSpecs?.SupportedMainboards && mbSpecs?.FormFactor) {
        if (!caseSpecs.SupportedMainboards.includes(mbSpecs.FormFactor)) {
            errors.push(`❌ Case không hỗ trợ Mainboard ${mbSpecs.FormFactor} (chỉ hỗ trợ: ${caseSpecs.SupportedMainboards.join(', ')})`);
        }
    }

    // 5. PSU vs System power
    const power = calculatePower(build);
    if (psuSpecs?.Wattage && power.recommended > 0) {
        if (psuSpecs.Wattage < power.recommended) {
            warnings.push(`⚠️ Nguồn ${psuSpecs.Wattage}W có thể không đủ. Đề xuất: ≥${power.recommended}W`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}

// ===================== POWER CALCULATOR =====================
function calculatePower(build: BuildState): PowerResult {
    const cpuSpecs = parseTechSpecs(build.cpu?.techSpecs);
    const vgaSpecs = parseTechSpecs(build.vga?.techSpecs);

    const cpuTDP = cpuSpecs?.TDP ?? 0;
    const vgaTDP = vgaSpecs?.TDP ?? 0;
    const basePower = 100; // Mainboard, RAM, SSD, Fans
    const currentDraw = cpuTDP + vgaTDP + basePower;
    const recommended = Math.ceil((currentDraw * 1.2) / 50) * 50; // Round up to nearest 50W

    return { currentDraw, recommended, cpuTDP, vgaTDP };
}

// ===================== PRODUCT SELECTION MODAL =====================
interface ProductModalProps {
    isOpen: boolean;
    slot: ComponentSlot;
    categoryId: number;
    onSelect: (product: Product) => void;
    onClose: () => void;
}

function ProductSelectionModal({ isOpen, slot, categoryId, onSelect, onClose }: ProductModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadProducts = useCallback(async (search?: string) => {
        setIsLoading(true);
        try {
            let url = `${API_URL}/products?categoryId=${categoryId}&limit=20`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            url += '&sort=price-asc';

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const productList = Array.isArray(data) ? data : (data.products || []);
                setProducts(productList.filter((p: Product) => p.stock > 0));
            }
        } catch (error) {
            console.error('Load products error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [categoryId]);

    // Load products when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setProducts([]);
            loadProducts();
        }
    }, [isOpen, loadProducts]);

    const handleSearch = () => {
        loadProducts(searchTerm);
    };

    if (!isOpen) return null;

    const slotInfo = COMPONENT_SLOTS.find(s => s.key === slot);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        {slotInfo?.icon}
                        Chọn {slotInfo?.label}
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={`Tìm ${slotInfo?.label}...`}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700">
                        <Search className="w-4 h-4" />
                    </Button>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isLoading && (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-2" />
                            <p className="text-gray-500">Đang tải sản phẩm...</p>
                        </div>
                    )}

                    {!isLoading && products.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Box className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>Không tìm thấy sản phẩm nào</p>
                        </div>
                    )}

                    {!isLoading && products.map((product) => {
                        const specs = parseTechSpecs(product.techSpecs);
                        const specsSummary = getSpecsSummary(specs);

                        return (
                            <div
                                key={product.id}
                                className="flex items-center gap-4 p-3 border rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-all cursor-pointer group"
                                onClick={() => { onSelect(product); onClose(); }}
                            >
                                <img
                                    src={getImageUrl(product.imageUrl)}
                                    alt={product.name}
                                    className="w-16 h-16 object-contain rounded-lg border bg-white"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    {specsSummary && (
                                        <p className="text-xs text-gray-500 mt-0.5">{specsSummary}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-bold text-red-600">{formatPrice(product.price)}</span>
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            Còn {product.stock}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                >
                                    Chọn
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ===================== MAIN COMPONENT =====================
export function BuildPCPage() {
    const { addToCart } = useCart();

    const [buildState, setBuildState] = useState<BuildState>({
        cpu: null,
        mainboard: null,
        ram: null,
        vga: null,
        ssd: null,
        psu: null,
        case: null,
        cooler: null,
        monitor: null,
    });

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        slot: ComponentSlot;
        categoryId: number;
    }>({ isOpen: false, slot: 'cpu', categoryId: 1 });

    // Computed values
    const totalPrice = useMemo(() => {
        return Object.values(buildState).reduce((sum, product) => {
            return sum + (product?.price || 0);
        }, 0);
    }, [buildState]);

    const power = useMemo(() => calculatePower(buildState), [buildState]);
    const validation = useMemo(() => validateCompatibility(buildState), [buildState]);

    const selectedCount = useMemo(() => {
        return Object.values(buildState).filter(p => p !== null).length;
    }, [buildState]);


    // Actions
    const handleSelectProduct = (slot: ComponentSlot, product: Product) => {
        setBuildState(prev => ({ ...prev, [slot]: product }));
    };

    const handleRemoveProduct = (slot: ComponentSlot) => {
        setBuildState(prev => ({ ...prev, [slot]: null }));
    };

    const handleOpenModal = (slot: ComponentSlot, categoryId: number) => {
        setModalState({ isOpen: true, slot, categoryId });
    };

    const handleReset = () => {
        setBuildState({
            cpu: null, mainboard: null, ram: null, vga: null,
            ssd: null, psu: null, case: null, cooler: null, monitor: null,
        });
    };

    const handleAddAllToCart = () => {
        Object.values(buildState).forEach(product => {
            if (product) {
                addToCart({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.imageUrl,
                }, 1);
            }
        });
        alert(`Đã thêm ${selectedCount} linh kiện vào giỏ hàng!`);
    };

    // PSU check
    const psuSpecs = parseTechSpecs(buildState.psu?.techSpecs);
    const isPSUInsufficient = psuSpecs?.Wattage ? psuSpecs.Wattage < power.recommended : false;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-6">
                    <Link to="/" className="text-gray-500 hover:text-red-600">Trang chủ</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800 font-medium">Xây dựng cấu hình PC</span>
                </nav>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🖥️ CHỌN LINH KIỆN XÂY DỰNG CẤU HÌNH
                    </h1>
                    <p className="text-gray-500">Chọn từng linh kiện để xây dựng cấu hình PC hoàn chỉnh</p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Main: Component List */}
                    <div className="lg:col-span-3">
                        {/* Reset Button */}
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Làm mới
                            </Button>
                            <span className="text-sm text-gray-500">
                                Đã chọn {selectedCount}/9 linh kiện
                            </span>
                        </div>

                        {/* Component Rows */}
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            {COMPONENT_SLOTS.map((slot, index) => {
                                const product = buildState[slot.key];
                                const specs = product ? parseTechSpecs(product.techSpecs) : null;
                                const specsSummary = getSpecsSummary(specs);

                                return (
                                    <div
                                        key={slot.key}
                                        className={`flex items-center gap-4 px-5 py-4 ${index < COMPONENT_SLOTS.length - 1 ? 'border-b border-gray-100' : ''
                                            } ${product ? 'bg-green-50/30' : ''}`}
                                    >
                                        {/* Number & Icon */}
                                        <div className="flex items-center gap-3 w-52 shrink-0">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${product
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                {slot.icon}
                                                <span className="font-semibold text-sm">{slot.label}</span>
                                            </div>
                                        </div>

                                        {/* Product Info or Select Button */}
                                        <div className="flex-1 min-w-0">
                                            {product ? (
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getImageUrl(product.imageUrl)}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-contain rounded-lg border bg-white shrink-0"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <Link
                                                            to={`/product/${product.id}`}
                                                            className="font-medium text-gray-800 hover:text-red-600 line-clamp-1 text-sm transition-colors"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        {specsSummary && (
                                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                                                {specsSummary}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenModal(slot.key, slot.categoryId)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-sm hover:shadow"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Chọn {slot.label}
                                                </button>
                                            )}
                                        </div>

                                        {/* Price & Remove */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            {product && (
                                                <>
                                                    <span className="font-bold text-red-600 text-sm whitespace-nowrap">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveProduct(slot.key)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-all"
                                                        title="Xóa"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Validation Messages */}
                        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                            <div className="mt-4 space-y-2">
                                {validation.errors.map((err, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{err}</span>
                                    </div>
                                ))}
                                {validation.warnings.map((warn, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{warn}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Power Widget */}
                        <div className="bg-white rounded-2xl shadow-sm border p-5">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Ước tính công suất
                            </h3>

                            {/* Power Bar */}
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Tiêu thụ dự kiến</span>
                                        <span className="font-bold text-gray-800">{power.currentDraw}W</span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isPSUInsufficient
                                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-600'
                                                }`}
                                            style={{
                                                width: `${psuSpecs?.Wattage
                                                    ? Math.min(100, (power.currentDraw / psuSpecs.Wattage) * 100)
                                                    : Math.min(100, (power.currentDraw / Math.max(power.recommended, 1)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <p className="text-gray-500">CPU</p>
                                        <p className="font-bold text-gray-800">{power.cpuTDP}W</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                                        <p className="text-gray-500">VGA</p>
                                        <p className="font-bold text-gray-800">{power.vgaTDP}W</p>
                                    </div>
                                </div>

                                <div className={`rounded-lg p-3 text-center ${isPSUInsufficient
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-green-50 border border-green-200'
                                    }`}>
                                    <p className="text-xs text-gray-500 mb-1">Nguồn đề xuất</p>
                                    <p className={`text-lg font-bold ${isPSUInsufficient ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        ≥ {power.recommended}W
                                    </p>
                                    {psuSpecs?.Wattage && (
                                        <p className={`text-xs mt-1 ${isPSUInsufficient ? 'text-red-500' : 'text-green-500'}`}>
                                            {isPSUInsufficient
                                                ? `⚠️ Nguồn hiện tại: ${psuSpecs.Wattage}W - KHÔNG ĐỦ`
                                                : `✅ Nguồn hiện tại: ${psuSpecs.Wattage}W - ĐỦ`
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Compatibility Status */}
                        <div className="bg-white rounded-2xl shadow-sm border p-5">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                {validation.isValid ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                )}
                                Tương thích
                            </h3>
                            <div className={`text-sm font-medium text-center py-2 rounded-lg ${validation.errors.length === 0
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                                }`}>
                                {validation.errors.length === 0
                                    ? '✅ Tất cả linh kiện tương thích'
                                    : `❌ Phát hiện ${validation.errors.length} lỗi`
                                }
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border p-5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-gray-600">Chi phí dự tính</span>
                                <span className="text-2xl font-bold text-red-600">
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>

                            <Button
                                onClick={handleAddAllToCart}
                                disabled={selectedCount === 0 || !validation.isValid}
                                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                THÊM VÀO GIỎ HÀNG
                            </Button>

                            {!validation.isValid && selectedCount > 0 && (
                                <p className="text-xs text-red-500 text-center mt-2">
                                    Vui lòng sửa lỗi tương thích trước khi thêm
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Selection Modal */}
            <ProductSelectionModal
                isOpen={modalState.isOpen}
                slot={modalState.slot}
                categoryId={modalState.categoryId}
                onSelect={(product) => handleSelectProduct(modalState.slot, product)}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
            />

            <Footer />
        </div>
    );
}
