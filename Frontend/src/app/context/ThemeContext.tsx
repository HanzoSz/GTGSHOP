import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeId, THEME_PRESETS } from '@/app/types/theme.types';

// =====================================================
// THEME CONTEXT - Quản lý theme globally
// =====================================================

interface ThemeContextType {
    currentTheme: Theme;
    themeId: ThemeId;
    setTheme: (themeId: ThemeId) => void;
    setCustomTheme: (colors: Partial<Theme['colors']>) => void;
    resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'gtg-shop-theme';

// =====================================================
// THEME PROVIDER
// =====================================================

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeId, setThemeId] = useState<ThemeId>('tet'); // Mặc định theme Tết
    const [customColors, setCustomColors] = useState<Partial<Theme['colors']>>({});

    // Load theme từ localStorage khi mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setThemeId(parsed.themeId || 'tet');
                if (parsed.customColors) {
                    setCustomColors(parsed.customColors);
                }
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    }, []);

    // Get current theme
    const currentTheme: Theme = themeId === 'custom'
        ? {
            ...THEME_PRESETS.custom,
            colors: {
                ...THEME_PRESETS.custom.colors,
                ...customColors,
            },
        }
        : THEME_PRESETS[themeId];

    // Apply CSS variables khi theme thay đổi
    useEffect(() => {
        const root = document.documentElement;
        const colors = currentTheme.colors;

        // Apply all color variables
        root.style.setProperty('--color-primary', colors.primary);
        root.style.setProperty('--color-primary-dark', colors.primaryDark);
        root.style.setProperty('--color-secondary', colors.secondary);
        root.style.setProperty('--color-secondary-dark', colors.secondaryDark);
        root.style.setProperty('--color-accent', colors.accent);
        root.style.setProperty('--color-accent-dark', colors.accentDark);
        root.style.setProperty('--color-background', colors.background);
        root.style.setProperty('--color-background-secondary', colors.backgroundSecondary);
        root.style.setProperty('--color-text', colors.text);
        root.style.setProperty('--color-text-secondary', colors.textSecondary);
        root.style.setProperty('--color-border', colors.border);
        root.style.setProperty('--color-success', colors.success);
        root.style.setProperty('--color-warning', colors.warning);
        root.style.setProperty('--color-error', colors.error);

        // Apply dark mode class (but NOT on admin pages)
        const isAdminPage = window.location.pathname.startsWith('/admin');
        if (currentTheme.isDark && !isAdminPage) {
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
        }

        // Save to localStorage
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    themeId,
                    customColors: themeId === 'custom' ? customColors : null,
                })
            );
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }, [currentTheme, themeId, customColors]);

    const setTheme = (newThemeId: ThemeId) => {
        setThemeId(newThemeId);
    };

    const setCustomTheme = (colors: Partial<Theme['colors']>) => {
        setCustomColors(colors);
        setThemeId('custom');
    };

    const resetTheme = () => {
        setThemeId('tet');
        setCustomColors({});
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                themeId,
                setTheme,
                setCustomTheme,
                resetTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

// =====================================================
// CUSTOM HOOK
// =====================================================

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
