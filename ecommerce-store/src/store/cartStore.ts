// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatCurrencyNumber } from '@/utils/currency';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  uniqueProductCode: string;
  image?: string;
}

interface ShippingDetails {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  accountNumber: string; // Phone number for MNO
}

interface CartState {
  items: CartItem[];
  shippingDetails: ShippingDetails; // <-- ADD THIS
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setShippingDetails: (details: ShippingDetails) => void; // <-- ADD THIS
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const initialState = { // Define initial state for clearing cart
    items: [],
    shippingDetails: { customerName: '', customerEmail: '', shippingAddress: '', accountNumber: ''}
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...initialState,
      // ... existing actions (addToCart, etc.) ...
      addToCart: (product) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            // Increment quantity if item already exists
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            // Add new item to cart
            return { items: [...state.items, { ...product, quantity: 1 }] };
          }
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
          ),
        })),
      setShippingDetails: (details) => set({ shippingDetails: details }), // <-- ADD THIS
      clearCart: () => set(initialState), // Reset to initial state
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (parseFloat(formatCurrencyNumber(item.price)) * item.quantity), 0);
      }
    }),
    {
      name: 'shopping-cart-storage', // Key for localStorage
    }
  )
);