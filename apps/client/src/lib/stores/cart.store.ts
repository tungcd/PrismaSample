import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];

  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;

  // Computed
  getTotal: () => number;
  getItemCount: () => number;
  getItem: (productId: number) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId,
          );

          if (existingItem) {
            // Update quantity if item exists
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + item.quantity, i.stock),
                    }
                  : i,
              ),
            };
          }

          // Add new item
          return { items: [...state.items, item] };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: Math.max(0, Math.min(quantity, item.stock)),
                  }
                : item,
            )
            .filter((item) => item.quantity > 0), // Remove if quantity is 0
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      clear: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getItem: (productId) => {
        const { items } = get();
        return items.find((item) => item.productId === productId);
      },
    }),
    {
      name: "cart-storage", // LocalStorage key
    },
  ),
);
