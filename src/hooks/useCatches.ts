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
