// =====================================================
// THEME TYPES & PRESETS - Định nghĩa các theme theo dịp lễ
// =====================================================

export interface ThemeColors {
    primary: string;
    primaryDark: string;
    secondary: string;
    secondaryDark: string;
    accent: string;
    accentDark: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
}

export interface Theme {
    id: string;
    name: string;
    description: string;
    icon: string;
    colors: ThemeColors;
    isDark: boolean;
}

export type ThemeId = 'tet' | 'noel' | 'halloween' | 'blackfriday' | 'default' | 'custom';

// =====================================================
// THEME PRESETS - Các theme có sẵn
// =====================================================

export const THEME_PRESETS: Record<ThemeId, Theme> = {
    tet: {
        id: 'tet',
        name: 'Tết 2026',
        description: 'Theme Tết truyền thống với màu đỏ vàng may mắn',
        icon: '🧧',
        isDark: false,
        colors: {
            primary: '#DC2626',           // Đỏ Tết
            primaryDark: '#B91C1C',       // Đỏ đậm
            secondary: '#F59E0B',         // Vàng kim
            secondaryDark: '#D97706',     // Vàng đậm
            accent: '#EC4899',            // Hồng mai
            accentDark: '#DB2777',        // Hồng đậm
            background: '#FEF2F2',        // Nền hồng nhạt
            backgroundSecondary: '#FFFFFF',
            text: '#1F2937',              // Text tối
            textSecondary: '#6B7280',
            border: '#FEE2E2',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
        },
    },

    noel: {
        id: 'noel',
        name: 'Giáng Sinh',
        description: 'Theme Noel với màu đỏ xanh truyền thống',
        icon: '🎄',
        isDark: false,
        colors: {
            primary: '#DC2626',           // Đỏ Noel
            primaryDark: '#B91C1C',
            secondary: '#10B981',         // Xanh lá thông
            secondaryDark: '#059669',
            accent: '#EAB308',            // Vàng sao
            accentDark: '#CA8A04',
            background: '#F0FDF4',        // Nền xanh nhạt
            backgroundSecondary: '#FFFFFF',
            text: '#1F2937',
            textSecondary: '#6B7280',
            border: '#DCFCE7',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
        },
    },

    halloween: {
        id: 'halloween',
        name: 'Halloween',
        description: 'Theme Halloween bí ẩn với cam tím đen',
        icon: '🎃',
        isDark: true,
        colors: {
            primary: '#F97316',           // Cam bí ngô
            primaryDark: '#EA580C',
            secondary: '#8B5CF6',         // Tím bí ẩn
            secondaryDark: '#7C3AED',
            accent: '#A855F7',            // Tím nhạt
            accentDark: '#9333EA',
            background: '#1F2937',        // Nền tối
            backgroundSecondary: '#111827',
            text: '#F9FAFB',              // Text sáng
            textSecondary: '#D1D5DB',
            border: '#374151',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
        },
    },

    blackfriday: {
        id: 'blackfriday',
        name: 'Black Friday',
        description: 'Theme Black Friday với đen đỏ mạnh mẽ',
        icon: '🏷️',
        isDark: true,
        colors: {
            primary: '#EF4444',           // Đỏ sale
            primaryDark: '#DC2626',
            secondary: '#FBBF24',         // Vàng giảm giá
            secondaryDark: '#F59E0B',
            accent: '#F43F5E',            // Hồng nổi bật
            accentDark: '#E11D48',
            background: '#111827',        // Nền đen
            backgroundSecondary: '#1F2937',
            text: '#F9FAFB',              // Text sáng
            textSecondary: '#D1D5DB',
            border: '#374151',
            success: '#10B981',
            warning: '#FBBF24',
            error: '#EF4444',
        },
    },

    default: {
        id: 'default',
        name: 'Mặc định',
        description: 'Theme mặc định của GTG Shop',
        icon: '🏪',
        isDark: false,
        colors: {
            primary: '#3B82F6',           // Xanh dương
            primaryDark: '#2563EB',
            secondary: '#8B5CF6',         // Tím
            secondaryDark: '#7C3AED',
            accent: '#EC4899',            // Hồng
            accentDark: '#DB2777',
            background: '#FFFFFF',
            backgroundSecondary: '#F9FAFB',
            text: '#1F2937',
            textSecondary: '#6B7280',
            border: '#E5E7EB',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
        },
    },

    custom: {
        id: 'custom',
        name: 'Tùy chỉnh',
        description: 'Theme tùy chỉnh theo ý bạn',
        icon: '🎨',
        isDark: false,
        colors: {
            primary: '#DC2626',
            primaryDark: '#B91C1C',
            secondary: '#F59E0B',
            secondaryDark: '#D97706',
            accent: '#EC4899',
            accentDark: '#DB2777',
            background: '#FFFFFF',
            backgroundSecondary: '#F9FAFB',
            text: '#1F2937',
            textSecondary: '#6B7280',
            border: '#E5E7EB',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
        },
    },
};
