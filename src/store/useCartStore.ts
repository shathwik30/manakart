import { create } from "zustand";
import { cartApi, CartItem, CartResponse } from "@/lib/api";
import toast from "react-hot-toast";

interface CartState {
  items: CartItem[];
  cartId: string | null;
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (data: { productId: string; variantId?: string; quantity?: number }) => Promise<void>;
  updateItem: (itemId: string, data: { quantity: number }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartId: null,
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  isOpen: false,
  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const data = await cartApi.get();
      set({
        items: data.items,
        cartId: data.cart?.id || null,
        subtotal: data.subtotal,
        itemCount: data.itemCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
  addItem: async (data) => {
    try {
      set({ isLoading: true });
      await cartApi.addItem(data);
      await get().fetchCart();
      toast.success("Added to cart");
      set({ isOpen: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add item");
      set({ isLoading: false });
    }
  },
  updateItem: async (itemId, data) => {
    try {
      set({ isLoading: true });
      await cartApi.updateItem(itemId, data);
      await get().fetchCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update item");
      set({ isLoading: false });
    }
  },
  removeItem: async (itemId) => {
    try {
      set({ isLoading: true });
      await cartApi.removeItem(itemId);
      await get().fetchCart();
      toast.success("Item removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove item");
      set({ isLoading: false });
    }
  },
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));
