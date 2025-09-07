// src/store/wishlistStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  uniqueProductCode: string;
  image?: string;
}

interface WishlistState {
  items: WishlistItem[];
  addToWishlist: (product: Omit<WishlistItem, 'quantity'>) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (product) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (!existingItem) {
            // Add new item to wishlist
            return { items: [...state.items, product] };
          }
          return state;
        }),
      removeFromWishlist: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.length;
      }
    }),
    {
      name: 'wishlist-storage', // Key for localStorage
    }
  )
);