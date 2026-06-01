import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/store/useAuthStore";
import { useFishSpecies } from "./useCatalog";

export type CatchItem = {
  id: string;
  species: string;
  species_id: string | null;
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
    const rawSpeciesId = record.species_id;
    
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
      species: "", // Will be populated by useCatches hook with species catalog data
      species_id: typeof rawSpeciesId === "string" ? rawSpeciesId : null,
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
  const fishSpeciesQuery = useFishSpecies();

  return useQuery({
    queryKey: ["catches"],
    queryFn: fetchCatches,
    enabled: isInitialized && !!user?.id && !!session?.access_token,
    staleTime: 15_000,
    gcTime: 60_000,
    select: (catches) => {
      // Create a map of species_id to species name for quick lookup
      const speciesMap = new Map<string, string>();
      
      if (Array.isArray(fishSpeciesQuery.data)) {
        fishSpeciesQuery.data.forEach((species) => {
          speciesMap.set(String(species.id), species.name);
        });
      }
      
      // Map catches and populate species names from the catalog
      return catches.map((catchItem) => ({
        ...catchItem,
        species: catchItem.species_id 
          ? (speciesMap.get(catchItem.species_id) || "Bilinmeyen Tür")
          : "Bilinmeyen Tür",
      }));
    },
  });
}

// ────────────────────────────────────────────────────────────────
// Fetch — most recent single catch (raw — species name resolved in hook)
// ────────────────────────────────────────────────────────────────

type RawLatestCatch = {
  speciesId: string | null;
  weightKg: number | null;
  date: string;
  location: string;
};

async function fetchLatestCatch(): Promise<RawLatestCatch | null> {
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

  // Backend stores species as species_id (UUID), not a name string
  const rawSpeciesId = record.species_id;

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
    speciesId: typeof rawSpeciesId === "string" ? rawSpeciesId : null,
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
  const fishSpeciesQuery = useFishSpecies();

  return useQuery({
    queryKey: ["catches", "latest"],
    queryFn: fetchLatestCatch,
    enabled: isInitialized && !!user?.id && !!session?.access_token,
    staleTime: 15_000,
    gcTime: 60_000,
    select: (raw): LatestCatch | null => {
      if (!raw) return null;

      // Build species_id → name lookup from the catalog
      const speciesMap = new Map<string, string>();
      if (Array.isArray(fishSpeciesQuery.data)) {
        fishSpeciesQuery.data.forEach((species) => {
          speciesMap.set(String(species.id), species.name);
        });
      }

      const resolvedName =
        raw.speciesId && speciesMap.has(raw.speciesId)
          ? (speciesMap.get(raw.speciesId) ?? "Bilinmeyen Tür")
          : "Bilinmeyen Tür";

      return {
        species: resolvedName,
        weightKg: raw.weightKg,
        date: raw.date,
        location: raw.location,
      };
    },
  });
}

