import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/store/useAuthStore";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export type OrderItem = {
  product_name: string;
  image_url: string | null;
  quantity: number;
  unit_price: number;
};

export type Order = {
  status: string;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
};

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

// Tarih biçimlendirme artık paylaşılan format modülünden gelir.
// Geriye dönük uyumluluk için takma ad (alias) olarak yeniden dışa aktarılır.
export { formatDate as formatOrderDate } from "@/utils/format";

/**
 * Backend sipariş durumunu Türkçe etikete çevirir.
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Beklemede";
    case "completed":
    case "delivered":
      return "Tamamlandı";
    case "cancelled":
      return "İptal Edildi";
    case "shipped":
      return "Kargoda";
    case "processing":
      return "Hazırlanıyor";
    default:
      return status;
  }
}

/**
 * Backend sipariş durumuna göre StatusBadge renk sınıflarını döndürür.
 */
export function getStatusColors(status: string): {
  bgClass: string;
  textClass: string;
} {
  switch (status) {
    case "pending":
      return {
        bgClass: "bg-mera-status-warning/20",
        textClass: "text-mera-status-warning",
      };
    case "completed":
    case "delivered":
      return {
        bgClass: "bg-mera-status-success/20",
        textClass: "text-mera-status-success",
      };
    case "cancelled":
      return {
        bgClass: "bg-mera-status-error/20",
        textClass: "text-mera-status-error",
      };
    case "shipped":
      return {
        bgClass: "bg-mera-status-info/20",
        textClass: "text-mera-status-info",
      };
    case "processing":
      return {
        bgClass: "bg-mera-primary/10 dark:bg-mera-accent/10",
        textClass: "text-mera-primary dark:text-mera-accent",
      };
    default:
      return {
        bgClass: "bg-mera-primary/10 dark:bg-mera-accent/10",
        textClass: "text-mera-primary dark:text-mera-accent",
      };
  }
}

// ────────────────────────────────────────────────────────────────
// Fetch
// ────────────────────────────────────────────────────────────────

async function fetchOrders(): Promise<Order[]> {
  const token = useAuthStore.getState().session?.access_token;

  if (!token) {
    throw new Error("Oturum hatası. Lütfen giriş yapın.");
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const response = await fetch(`${baseUrl}/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let backendMessage = "";

    try {
      const text = await response.text();

      if (text) {
        try {
          const data = JSON.parse(text);
          if (typeof data?.message === "string") {
            backendMessage = data.message;
          } else {
            backendMessage = text;
          }
        } catch {
          backendMessage = text;
        }
      }
    } catch {
      backendMessage = "";
    }

    throw new Error(backendMessage || `HTTP ${response.status}`);
  }

  const payload = (await response.json()) as unknown;

  // Backend { message, data: Order[] } zarfını destekle
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: Order[] }).data;
  }

  if (Array.isArray(payload)) {
    return payload as Order[];
  }

  return [];
}

// ────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────

export function useOrders() {
  const { user, session, isInitialized } = useAuthStore();

  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: isInitialized && !!user?.id && !!session?.access_token,
    staleTime: 30_000,
    gcTime: 120_000,
  });
}
