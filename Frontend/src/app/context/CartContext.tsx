import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '@/config';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const prevUserIdRef = useRef<number | null>(null);

  // Load cart khi user thay đổi
  useEffect(() => {
    // Chờ auth load xong trước khi xử lý cart
    if (authLoading) return;

    if (isAuthenticated && user) {
      // Chỉ load lại nếu user thay đổi (tránh load trùng)
      if (prevUserIdRef.current !== user.id) {
        prevUserIdRef.current = user.id;
        // Load từ API nếu đã đăng nhập
        loadCartFromAPI();
      }
    } else {
      // User đã logout
      if (prevUserIdRef.current !== null) {
        prevUserIdRef.current = null;
        // Xóa cart khi logout để không hiện dữ liệu cũ
        setItems([]);
      } else {
        // Chưa đăng nhập, load từ localStorage (guest cart)
        loadCartFromStorage();
      }
    }
  }, [isAuthenticated, user, authLoading]);

  // Load cart từ localStorage
  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  };

  // Save cart vào localStorage
  const saveCartToStorage = (cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  // Load cart từ API (khi đã đăng nhập)
  const loadCartFromAPI = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const rawItems = data.items || data.Items || [];
        // Map API fields (hỗ trợ cả camelCase và PascalCase)
        const mappedItems: CartItem[] = rawItems.map((item: any) => ({
          id: item.id || item.Id || Date.now(),
          productId: item.productId || item.ProductId,
          name: item.name || item.Name || '',
          price: item.price || item.Price || 0,
          image: item.image || item.Image || '',
          quantity: item.quantity || item.Quantity || 1,
        }));
        setItems(mappedItems);
      }
    } catch (error) {
      console.error('Load cart error:', error);
      // Fallback to localStorage
      loadCartFromStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Sync cart với API
  const syncCartWithAPI = async (cartItems: CartItem[]) => {
    if (!isAuthenticated) {
      saveCartToStorage(cartItems);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cartItems }),
      });
    } catch (error) {
      console.error('Sync cart error:', error);
    }

    // Luôn save vào localStorage như backup
    saveCartToStorage(cartItems);
  };

  // Thêm sản phẩm vào giỏ
  const addToCart = (product: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.productId === product.productId);

      let newItems: CartItem[];

      if (existingItem) {
        // Cập nhật số lượng nếu đã có
        newItems = currentItems.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Thêm mới
        const newItem: CartItem = {
          id: Date.now(),
          ...product,
          quantity,
        };
        newItems = [...currentItems, newItem];
      }

      syncCartWithAPI(newItems);
      return newItems;
    });
  };

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId: number) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.productId !== productId);
      syncCartWithAPI(newItems);
      return newItems;
    });
  };

  // Cập nhật số lượng
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems => {
      const newItems = currentItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      syncCartWithAPI(newItems);
      return newItems;
    });
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setItems([]);
    syncCartWithAPI([]);
  };

  // Tính tổng số lượng
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Tính tổng tiền
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}