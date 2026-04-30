import { useCallback, useState } from "react";

import {
    TechnicalTipsInput,
    TechniqueTip,
    useAssistantStore,
} from "@/store/useAssistantStore";

type ApiTechniqueTip = {
  baslik?: string;
  altBaslik?: string;
  maddeler?: string[];
};

type ApiTechnicalTipsResponse = {
  taktikler?: ApiTechniqueTip[];
};

const mapTips = (tips: ApiTechniqueTip[] | undefined): TechniqueTip[] => {
  if (!tips) {
    return [];
  }

  return tips.map((tip) => {
    const items = Array.isArray(tip.maddeler)
      ? tip.maddeler.filter(
          (item) => typeof item === "string" && item.trim().length > 0,
        )
      : [];

    return {
      title: tip.baslik?.trim() || "Taktik",
      subtitle: tip.altBaslik?.trim() || undefined,
      items,
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

export function useTechnicalTips() {
  const technicalTips = useAssistantStore((state) => state.technicalTips);
  const setTechnicalTips = useAssistantStore((state) => state.setTechnicalTips);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<TechnicalTipsInput | null>(
    technicalTips.lastRequest,
  );

  const getTips = useCallback(
    async (input: TechnicalTipsInput) => {
      setIsLoading(true);
      setError(null);
      setLastRequest(input);

      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
        const response = await fetch(`${baseUrl}/technical-tips`, {
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

        const payload = (await response.json()) as ApiTechnicalTipsResponse;
        const tips = mapTips(payload.taktikler);

        setTechnicalTips({
          request: input,
          result: tips,
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
    [setTechnicalTips],
  );

  const retry = useCallback(() => {
    const request = lastRequest ?? technicalTips.lastRequest;
    if (!request) {
      return;
    }
    void getTips(request);
  }, [getTips, lastRequest, technicalTips.lastRequest]);

  return {
    data: technicalTips.lastResult,
    lastRequest: technicalTips.lastRequest,
    isLoading,
    error,
    getTips,
    retry,
  };
}
