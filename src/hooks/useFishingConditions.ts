/**
 * useFishingConditions — Balık av koşullarını API'den çeker.
 *
 * GET /weather?lat=&lon= ve GET /fishing-conditions?userLat=&userLng= isteklerini
 * paralel olarak atar; sonuçları FishingConditionsHeroCard'ın beklediği şekle dönüştürür.
 *
 * Kullanım yerleri:
 * - Ana sayfa (src/app/index.tsx) av koşulları hero kartını doldurmak için
 */
import { useCallback, useEffect, useState } from "react";

// ────────────────────────────────────────────────────────────────
// Tip tanımları
// ────────────────────────────────────────────────────────────────

type ConditionsStatus = "good" | "okay" | "poor";

export interface FishingConditionsData {
  status: ConditionsStatus;
  temperature: number;
  windSpeed: number;
  pressure: number;
  summary: string;
}

interface WeatherApiResponse {
  temperature: number;
  windSpeed: number;
  pressure: number;
  safetyWarnings?: string[];
}

interface FishingConditionsApiResponse {
  ai: {
    status: "good" | "okay" | "poor";
    description: string;
  };
}

interface UseFishingConditionsReturn {
  data: FishingConditionsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────

export function useFishingConditions(
  coords: { latitude: number; longitude: number } | null,
): UseFishingConditionsReturn {
  const [data, setData] = useState<FishingConditionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Koordinatlar hazır değilse isteği beklet
    if (!coords) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function fetchConditions() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
        const { latitude: lat, longitude: lon } = coords!;

        const weatherUrl = `${baseUrl}/weather?lat=${lat}&lon=${lon}`;
        const conditionsUrl = `${baseUrl}/fishing-conditions?userLat=${lat}&userLng=${lon}`;

        // Her iki isteği paralel olarak gönder
        const [weatherRes, conditionsRes] = await Promise.all([
          fetch(weatherUrl),
          fetch(conditionsUrl),
        ]);

        if (!weatherRes.ok) {
          throw new Error(`Hava durumu alınamadı (HTTP ${weatherRes.status})`);
        }
        if (!conditionsRes.ok) {
          throw new Error(
            `Av koşulları alınamadı (HTTP ${conditionsRes.status})`,
          );
        }

        const [weather, conditions] = (await Promise.all([
          weatherRes.json(),
          conditionsRes.json(),
        ])) as [WeatherApiResponse, FishingConditionsApiResponse];

        if (isMounted) {
          setData({
            temperature: Math.round(weather.temperature),
            windSpeed: Math.round(weather.windSpeed * 10) / 10,
            pressure: Math.round(weather.pressure),
            status: conditions.ai.status,
            summary: conditions.ai.description,
          });
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            "Av koşulları yüklenemedi. Lütfen internet bağlantınızı kontrol edin.",
          );
          setIsLoading(false);
        }
      }
    }

    fetchConditions();

    return () => {
      isMounted = false;
    };
  }, [coords, fetchTrigger]);

  return { data, isLoading, error, refetch };
}
