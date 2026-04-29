import { useQuery } from "@tanstack/react-query";

export type CatalogItem = {
  id: string | number;
  name: string;
};

async function fetchCatalog(endpoint: string): Promise<CatalogItem[]> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  const response = await fetch(`${baseUrl}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch catalog: ${response.status}`);
  }

  const json = await response.json();

  if (Array.isArray(json)) {
    return json;
  }

  if (json && Array.isArray(json.data)) {
    return json.data;
  }

  return [];
}

export function useFishSpecies() {
  return useQuery({
    queryKey: ["catalog", "fish-species"],
    queryFn: () => fetchCatalog("/catalog/fish-species"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFishingStyles() {
  return useQuery({
    queryKey: ["catalog", "fishing-styles"],
    queryFn: () => fetchCatalog("/catalog/fishing-styles"),
    staleTime: 5 * 60 * 1000,
  });
}
