/**
 * useFishingSpots — Av alanlarını API'den çeker ve yönetir.
 * NestJS backend /fishing-spots endpoint'i ile iletişim kurar.
 */
import { useCallback, useEffect, useState } from "react";

export interface FishingSpot {
  id: string;
  name: string;
  description: string | null;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  water_type: string;
  min_depth: number | null;
  max_depth: number | null;
}

interface UseFishingSpotsReturn {
  spots: FishingSpot[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFishingSpots(
  enabled: boolean = true,
): UseFishingSpotsReturn {
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setFetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSpots([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchSpots() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
        const url = `${baseUrl}/fishing-spots`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const rawData = await response.json();

        // Handle both direct array and wrapped response formats
        let data: FishingSpot[];
        if (rawData && Array.isArray(rawData.data)) {
          data = rawData.data;
        } else {
          data = [];
        }

        if (isMounted) {
          setSpots(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Meralar yüklenemedi. Lütfen tekrar deneyin.");
          setLoading(false);
        }
      }
    }

    fetchSpots();

    return () => {
      isMounted = false;
    };
  }, [enabled, fetchTrigger]);

  return { spots, loading, error, refetch };
}
