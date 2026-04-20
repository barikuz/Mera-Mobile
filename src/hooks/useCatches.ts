import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/store/useAuthStore";

export type CatchItem = {
  id: string;
  species: string;
  created_at: string | null;
  weight_kg: number | null;
  length_cm: number | null;
  location_lat: number | null;
  location_lng: number | null;
};

async function fetchCatches(): Promise<CatchItem[]> {
  const token = useAuthStore.getState().session?.access_token;

  if (!token) {
    throw new Error("Oturum hatası. Lütfen giriş yapın.");
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const response = await fetch(`${baseUrl}/catches`, {
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

  const records = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? ((payload as { data: unknown[] }).data ?? [])
      : Array.isArray((payload as { items?: unknown[] })?.items)
        ? ((payload as { items: unknown[] }).items ?? [])
        : Array.isArray((payload as { catches?: unknown[] })?.catches)
          ? ((payload as { catches: unknown[] }).catches ?? [])
          : [];

  return records.map((item, index) => {
    const record = item as Record<string, unknown>;
    const rawSpecies = record.species;
    const rawDate =
      typeof record.created_at === "string"
        ? record.created_at
        : typeof record.date === "string"
          ? record.date
          : typeof record.caught_at === "string"
            ? record.caught_at
            : null;

    return {
      id:
        typeof record.id === "string" || typeof record.id === "number"
          ? String(record.id)
          : `${index}-${rawDate ?? "catch"}`,
      species:
        typeof rawSpecies === "string" && rawSpecies.trim().length > 0
          ? rawSpecies.trim()
          : "Bilinmeyen Tür",
      created_at: rawDate,
      weight_kg: typeof record.weight_kg === "number" ? record.weight_kg : null,
      length_cm: typeof record.length_cm === "number" ? record.length_cm : null,
      location_lat:
        typeof record.location_lat === "number" ? record.location_lat : null,
      location_lng:
        typeof record.location_lng === "number" ? record.location_lng : null,
    };
  });
}

export function useCatches() {
  const { user, session, isInitialized } = useAuthStore();

  return useQuery({
    queryKey: ["catches"],
    queryFn: fetchCatches,
    enabled: isInitialized && !!user?.id && !!session?.access_token,
    staleTime: 15_000,
    gcTime: 60_000,
  });
}
