import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItemCount: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartItem[]) => {
  // Toplamlar store içinde tutuluyor; böylece UI tarafında tekrar reduce çalıştırmaya gerek kalmıyor.
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { totalPrice, totalItemCount };
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalPrice: 0,
      totalItemCount: 0,

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (cartItem) => cartItem.productId === item.productId,
          );

          // Aynı ürün tekrar eklenirse yeni satır açmak yerine adet artırılır.
          const items = existingItem
            ? state.items.map((cartItem) =>
                cartItem.productId === item.productId
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem,
              )
            : [...state.items, { ...item, quantity: 1 }];

          return {
            items,
            ...calculateTotals(items),
          };
        }),

      removeFromCart: (productId) =>
        set((state) => {
          const items = state.items.filter(
            (item) => item.productId !== productId,
          );

          return {
            items,
            ...calculateTotals(items),
          };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const items =
            quantity < 1
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
                );

          return {
            items,
            ...calculateTotals(items),
          };
        }),

      clearCart: () =>
        set({
          items: [],
          totalPrice: 0,
          totalItemCount: 0,
        }),
    }),
    {
      name: "mera-cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Kalıcı depoya yalnızca temel veri yazılır; türetilmiş alanlar tekrar hesaplanır.
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        // Uygulama yeniden açıldığında toplamlar depodan değil items dizisinden türetilir.
        const { totalPrice, totalItemCount } = calculateTotals(state.items);
        state.totalPrice = totalPrice;
        state.totalItemCount = totalItemCount;
      },
    },
  ),
);
