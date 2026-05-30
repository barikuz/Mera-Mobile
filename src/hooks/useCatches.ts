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

/** Shape consumed by the "Son Av" card on the home screen */
export type LatestCatch = {
  species: string;
  weightKg: number | null;
  date: string;
  location: string;
};

// ────────────────────────────────────────────────────────────────
// Date helper
// ────────────────────────────────────────────────────────────────

export function formatCatchDate(isoString: string | null): string {
  if (!isoString) return "Tarih bilgisi yok";
  try {
    // Supabase bazen timezone suffix'i olmadan UTC string döndürür
    // (örn. "2026-05-30T20:15:00"). Bu durumda JS engine
    // string'i local time olarak parse eder ve saat yanlış çıkar.
    // Suffix yoksa eksplisit olarak UTC olduğunu belirtiyoruz.
    const normalised =
      /[Z+\-]\d*$/.test(isoString.trim()) ? isoString : isoString + "Z";
    const d = new Date(normalised);
    if (Number.isNaN(d.getTime())) return "Tarih bilgisi yok";
    return d.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Tarih bilgisi yok";
  }
}

function formatCoords(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null) return "Konum belirtilmedi";
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

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

// ────────────────────────────────────────────────────────────────
// Fetch — most recent single catch
// ────────────────────────────────────────────────────────────────

async function fetchLatestCatch(): Promise<LatestCatch | null> {
  const token = useAuthStore.getState().session?.access_token;

  if (!token) {
    throw new Error("Oturum hatası. Lütfen giriş yapın.");
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const response = await fetch(`${baseUrl}/catches?limit=1&sort=desc`, {
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

  // Support both bare array and wrapped { data: [], message: '' } envelope
  const records: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? ((payload as { data: unknown[] }).data ?? [])
      : [];

  if (records.length === 0) return null;

  const record = records[0] as Record<string, unknown>;

  const rawSpecies = record.species;
  const rawDate =
    typeof record.created_at === "string"
      ? record.created_at
      : typeof record.caught_at === "string"
        ? record.caught_at
        : null;

  const lat =
    typeof record.location_lat === "number" ? record.location_lat : null;
  const lng =
    typeof record.location_lng === "number" ? record.location_lng : null;

  return {
    species:
      typeof rawSpecies === "string" && rawSpecies.trim().length > 0
        ? rawSpecies.trim()
        : "Bilinmeyen Tür",
    weightKg: typeof record.weight_kg === "number" ? record.weight_kg : null,
    date: rawDate ? formatCatchDate(rawDate) : "—",
    location: formatCoords(lat, lng),
  };
}

// ────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────

export function useLatestCatch() {
  const { user, session, isInitialized } = useAuthStore();

  return useQuery({
    queryKey: ["catches", "latest"],
    queryFn: fetchLatestCatch,
    enabled: isInitialized && !!user?.id && !!session?.access_token,
    staleTime: 15_000,
    gcTime: 60_000,
  });
}
