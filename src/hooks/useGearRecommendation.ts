import { useCallback, useState } from "react";

import {
    GearRecommendationInput,
    GearRecommendationItem,
    useAssistantStore,
} from "@/store/useAssistantStore";

type ApiGearItem = {
  productId?: string | number;
  kategori?: string;
  urunAdi?: string;
  fiyat?: number;
  uzmanNotu?: string;
};

type ApiGearRecommendationResponse = {
  onerilen_set?: ApiGearItem[];
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\u0131/g, "i")
    .replace(/\u015f/g, "s")
    .replace(/\u011f/g, "g")
    .replace(/\u00e7/g, "c")
    .replace(/\u00f6/g, "o")
    .replace(/\u00fc/g, "u");

const resolveGearType = (
  kategori: string | undefined,
): GearRecommendationItem["type"] => {
  const normalized = normalizeText(kategori ?? "");

  if (normalized.includes("makine") || normalized.includes("reel")) {
    return "reel";
  }

  if (
    normalized.includes("yem") ||
    normalized.includes("sahte") ||
    normalized.includes("bait")
  ) {
    return "bait";
  }

  return "rod";
};

const labelByType: Record<GearRecommendationItem["type"], string> = {
  rod: "Kam\u0131\u015f",
  reel: "Makine",
  bait: "Yem / Sahte Yem",
};

const iconByType: Record<GearRecommendationItem["type"], string> = {
  rod: "fish",
  reel: "rotate-3d-variant",
  bait: "hook",
};

const mapGearItems = (
  items: ApiGearItem[] | undefined,
): GearRecommendationItem[] => {
  if (!items) {
    return [];
  }

  return items.map((item) => {
    const type = resolveGearType(item.kategori);
    const price =
      typeof item.fiyat === "number" && Number.isFinite(item.fiyat)
        ? item.fiyat
        : 0;

    return {
      type,
      label: item.kategori?.trim() || labelByType[type],
      icon: iconByType[type],
      productId: item.productId ? String(item.productId) : undefined,
      name: item.urunAdi?.trim() || "",
      price,
      expertNote: item.uzmanNotu?.trim() || "",
    };
  });
};

const getErrorMessage = async (response: Response) => {
  try {
    const text = await response.text();
    if (!text) {
      return "";
    }

    try {
      const data = JSON.parse(text);
      if (typeof data?.message === "string") {
        return data.message;
      }
    } catch {
      return text;
    }

    return text;
  } catch {
    return "";
  }
};

export function useGearRecommendation() {
  const gearRecommendation = useAssistantStore(
    (state) => state.gearRecommendation,
  );
  const setGearRecommendation = useAssistantStore(
    (state) => state.setGearRecommendation,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] =
    useState<GearRecommendationInput | null>(gearRecommendation.lastRequest);

  const getRecommendation = useCallback(
    async (input: GearRecommendationInput) => {
      setIsLoading(true);
      setError(null);
      setLastRequest(input);

      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
        const response = await fetch(`${baseUrl}/gear-recommendation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetFish: input.targetFish,
            fishingStyle: input.fishingStyle,
            coordinates: {
              lat: input.coordinates.latitude,
              lng: input.coordinates.longitude,
            },
          }),
        });

        if (!response.ok) {
          const message = await getErrorMessage(response);
          throw new Error(message || `HTTP ${response.status}`);
        }

        const payload =
          (await response.json()) as ApiGearRecommendationResponse;
        let recommendations = mapGearItems(payload.onerilen_set);

        // Attempt to resolve product image URLs for items that include a productId.

        const fetchImageForItem = async (item: GearRecommendationItem) => {
          if (!item.productId) return item;

          try {
            const res = await fetch(
              `${baseUrl}/shop/products/${item.productId}`,
            );
            if (!res.ok) return item;

            const json = await res.json();
            // Product object may be directly returned or under `data`.
            const product = json?.data ?? json;

            const imageUrl = product?.image_url;
            return { ...item, imageUrl };
          } catch {
            return item;
          }
        };

        const resolved = await Promise.all(
          recommendations.map((it) => fetchImageForItem(it)),
        );

        recommendations = resolved;

        setGearRecommendation({
          request: input,
          result: recommendations,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "\u00d6neri al\u0131namad\u0131. L\u00fctfen tekrar deneyin.";
        setError(
          message ||
            "\u00d6neri al\u0131namad\u0131. L\u00fctfen tekrar deneyin.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setGearRecommendation],
  );

  const retry = useCallback(() => {
    const request = lastRequest ?? gearRecommendation.lastRequest;
    if (!request) {
      return;
    }
    void getRecommendation(request);
  }, [getRecommendation, lastRequest, gearRecommendation.lastRequest]);

  return {
    data: gearRecommendation.lastResult,
    lastRequest: gearRecommendation.lastRequest,
    isLoading,
    error,
    getRecommendation,
    retry,
  };
}
