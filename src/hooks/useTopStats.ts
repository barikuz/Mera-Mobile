/**
 * useTopStats — Uygulama genelinde kullanılan sıralama istatistikleri.
 *
 * İki bağımsız hook export eder:
 *  - useTopProducts  → GET /orders/top-products?limit=4
 *  - useTopFish      → GET /catches/top-fish?limit=5
 *
 * Her ikisi de kimlik doğrulaması gerektirmeyen, herkese açık endpointlerdir.
 * Proje genelinde kullanılan `fetch` + `@tanstack/react-query` pattern'ı izler.
 */

import { useQuery } from "@tanstack/react-query";

// ────────────────────────────────────────────────────────────────
// Tipler
// ────────────────────────────────────────────────────────────────

export interface TopProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

// ────────────────────────────────────────────────────────────────
// Fetch — En çok satılan ürünler
// ────────────────────────────────────────────────────────────────

async function fetchTopProducts(): Promise<TopProduct[]> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/orders/top-products?limit=4`);

  if (!response.ok) {
    throw new Error(`Top products fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;

  // Support bare array, { data: [] } and { items: [] } envelopes
  const records: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? ((payload as { data: unknown[] }).data ?? [])
      : Array.isArray((payload as { items?: unknown[] })?.items)
        ? ((payload as { items: unknown[] }).items ?? [])
        : [];

  return records.map((item, index) => {
    const r = item as Record<string, unknown>;
    return {
      id:
        typeof r.id === "string" || typeof r.id === "number"
          ? String(r.id)
          : `top-product-${index}`,
      name: typeof r.name === "string" && r.name.trim().length > 0
        ? r.name.trim()
        : "İsimsiz Ürün",
      price: typeof r.price === "number" ? r.price : 0,
      image_url: typeof r.image_url === "string" ? r.image_url : "",
    };
  });
}

export function useTopProducts() {
  return useQuery({
    queryKey: ["home", "top-products"],
    queryFn: fetchTopProducts,
    staleTime: 60_000,
    gcTime: 120_000,
  });
}

// ────────────────────────────────────────────────────────────────
// Fetch — En çok tutulan balıklar
// ────────────────────────────────────────────────────────────────

async function fetchTopFish(): Promise<string[]> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  const response = await fetch(`${baseUrl}/catches/top-fish?limit=5`);

  if (!response.ok) {
    throw new Error(`Top fish fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;

  // Support bare string[], { data: string[] } and { items: string[] }
  const records: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? ((payload as { data: unknown[] }).data ?? [])
      : Array.isArray((payload as { items?: unknown[] })?.items)
        ? ((payload as { items: unknown[] }).items ?? [])
        : [];

  // Each element may be a plain string or an object with a species/name field
  return records
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const r = item as Record<string, unknown>;
        if (typeof r.species === "string") return r.species.trim();
        if (typeof r.name === "string") return r.name.trim();
      }
      return "";
    })
    .filter(Boolean);
}

export function useTopFish() {
  return useQuery({
    queryKey: ["home", "top-fish"],
    queryFn: fetchTopFish,
    staleTime: 60_000,
    gcTime: 120_000,
  });
}
