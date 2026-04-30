import { useCallback, useState } from "react";

import {
    RecommendedSpot,
    SpotRecommendationInput,
    useAssistantStore,
} from "@/store/useAssistantStore";

type ApiCoordinate = {
  lat?: number;
  lng?: number;
};

type ApiSpotRecommendation = {
  meraAdi?: string;
  suTipi?: string;
  derinlik?: string;
  aciklama?: string;
  koordinat?: ApiCoordinate;
};

type ApiSpotRecommendationResponse = {
  onerilen_meralar?: ApiSpotRecommendation[];
};

const normalizeWaterType = (value: string | undefined) => {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("tatli")) {
    return "Tatl\u0131 Su";
  }
  if (normalized.includes("tuzlu")) {
    return "Tuzlu Su";
  }
  if (normalized.includes("akarsu")) {
    return "Akarsu";
  }
  return value?.trim() || "Tatl\u0131 Su";
};

const toNumber = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const mapSpotRecommendations = (
  items: ApiSpotRecommendation[] | undefined,
): RecommendedSpot[] => {
  if (!items) {
    return [];
  }

  return items
    .map((item, index) => {
      const latitude = toNumber(item.koordinat?.lat);
      const longitude = toNumber(item.koordinat?.lng);

      if (latitude === null || longitude === null) {
        return null;
      }

      const name = item.meraAdi?.trim() || "Bilinmeyen Mera";

      return {
        id: `${name}-${latitude}-${longitude}-${index}`,
        name,
        description: item.aciklama?.trim() || "",
        waterType: normalizeWaterType(item.suTipi),
        depthRange: item.derinlik?.trim() || "-",
        coordinate: { latitude, longitude },
      };
    })
    .filter((item): item is RecommendedSpot => item !== null);
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

export function useSpotRecommendation() {
  const spotRecommendation = useAssistantStore(
    (state) => state.spotRecommendation,
  );
  const setSpotRecommendation = useAssistantStore(
    (state) => state.setSpotRecommendation,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] =
    useState<SpotRecommendationInput | null>(spotRecommendation.lastRequest);

  const getRecommendation = useCallback(
    async (input: SpotRecommendationInput) => {
      setIsLoading(true);
      setError(null);
      setLastRequest(input);

      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
        const response = await fetch(`${baseUrl}/spot-recommendation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetFish: input.targetFish,
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
          (await response.json()) as ApiSpotRecommendationResponse;
        const recommendations = mapSpotRecommendations(
          payload.onerilen_meralar,
        );

        setSpotRecommendation({
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
    [setSpotRecommendation],
  );

  const retry = useCallback(() => {
    const request = lastRequest ?? spotRecommendation.lastRequest;
    if (!request) {
      return;
    }
    void getRecommendation(request);
  }, [getRecommendation, lastRequest, spotRecommendation.lastRequest]);

  return {
    data: spotRecommendation.lastResult,
    lastRequest: spotRecommendation.lastRequest,
    isLoading,
    error,
    getRecommendation,
    retry,
  };
}
