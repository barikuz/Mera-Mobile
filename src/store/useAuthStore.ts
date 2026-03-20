import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

// Mağazamızın (Store) içinde hangi verilerin olacağını tanımlıyoruz (TypeScript Interface)
interface AuthState {
  session: Session | null; // Supabase'den gelen oturum jetonu detayları
  user: User | null; // Kullanıcının temel bilgileri (id, email vb.)
  isInitialized: boolean; // Uygulama ilk açıldığında Supabase kontrolü bitti mi?
  setSession: (session: Session | null) => void; // Oturumu güncelleyen fonksiyon
  setInitialized: (isInitialized: boolean) => void; // Başlangıç kontrolünü güncelleyen fonksiyon
}

// Zustand mağazamızı oluşturuyoruz
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,

  // setSession çağrıldığında hem session'ı hem de session içindeki user'ı otomatik günceller
  setSession: (session) => set({ session, user: session?.user || null }),

  setInitialized: (isInitialized) => set({ isInitialized }),
}));
