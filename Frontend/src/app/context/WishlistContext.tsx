import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface WishlistItem {
    id: number;
    productId: number;
    name: string;
    price: number;
    image: string | null;
    stock: number;
    discount: number;
    rating: number;
    createdAt: string;
}

interface WishlistContextType {
    items: WishlistItem[];
    wishlistCount: number;
    isInWishlist: (productId: number) => boolean;
    toggleWishlist: (productId: number) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

import { IMAGE_BASE_URL as API_BASE } from '@/config';

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const prevUserIdRef = useRef<number | null>(null);

    // Load wishlist khi user thay đổi
    useEffect(() => {
        if (authLoading) return;

        if (isAuthenticated && user) {
            if (prevUserIdRef.current !== user.id) {
                prevUserIdRef.current = user.id;
                loadWishlist();
            }
        } else {
            if (prevUserIdRef.current !== null) {
                prevUserIdRef.current = null;
                setItems([]);
                setWishlistIds(new Set());
            }
        }
    }, [isAuthenticated, user, authLoading]);

    const getToken = () => localStorage.getItem('token');

    const loadWishlist = async () => {
        try {
            setIsLoading(true);
            const token = getToken();
            const response = await fetch(`${API_BASE}/api/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                const rawItems = data.items || [];
                setItems(rawItems);
                setWishlistIds(new Set(rawItems.map((item: WishlistItem) => item.productId)));
            }
        } catch (error) {
            console.error('Load wishlist error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isInWishlist = (productId: number): boolean => {
        return wishlistIds.has(productId);
    };

    const toggleWishlist = async (productId: number) => {
        if (!isAuthenticated) return;

        const token = getToken();

        if (isInWishlist(productId)) {
            // Optimistic UI: remove immediately
            setWishlistIds(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
            setItems(prev => prev.filter(item => item.productId !== productId));

            try {
                await fetch(`${API_BASE}/api/wishlist/${productId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            } catch (error) {
                console.error('Remove from wishlist error:', error);
                // Revert on error
                loadWishlist();
            }
        } else {
            // Optimistic UI: add immediately
            setWishlistIds(prev => new Set(prev).add(productId));

            try {
                const response = await fetch(`${API_BASE}/api/wishlist/${productId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (response.ok) {
                    // Reload to get full item details
                    loadWishlist();
                }
            } catch (error) {
                console.error('Add to wishlist error:', error);
                // Revert on error
                setWishlistIds(prev => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
            }
        }
    };

    const removeFromWishlist = async (productId: number) => {
        if (!isAuthenticated) return;

        const token = getToken();

        // Optimistic UI
        setWishlistIds(prev => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
        });
        setItems(prev => prev.filter(item => item.productId !== productId));

        try {
            await fetch(`${API_BASE}/api/wishlist/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            loadWishlist();
        }
    };

    return (
        <WishlistContext.Provider value={{
            items,
            wishlistCount: wishlistIds.size,
            isInWishlist,
            toggleWishlist,
            removeFromWishlist,
            isLoading,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
}
