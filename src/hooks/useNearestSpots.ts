/**
 * useNearestSpots — En yakın av noktalarını API'den çeker.
 *
 * GET /fishing-spots/nearest?lat=&lng=&limit= isteğini atar;
 * sonuçları SpotCard bileşeninin beklediği şekle dönüştürür.
 *
 * Kullanım yerleri:
 * - Ana sayfa (src/app/index.tsx) "En Yakın Meralar" bölümünü doldurmak için
 */
import { useCallback, useEffect, useState } from "react";

// ────────────────────────────────────────────────────────────────
// Tip tanımları
// ────────────────────────────────────────────────────────────────

/**
 * API yanıtından gelen ham spot nesnesi.
 * get_closest_fishing_spots RPC'nin döndürdüğü alanlarla birebir eşleşir.
 * id ve distanceKm RPC tarafından döndürülmez.
 */
interface NearestSpotApiItem {
  name: string;
  center_lat: number | string;
  center_lng: number | string;
  water_type: string;
  min_depth?: number | null;
  max_depth?: number | null;
}

/** SpotCard ve harita bileşenlerine aktarılan normalize edilmiş tip */
export interface NearestSpot {
  id: string;
  name: string;
  distanceLabel: string;
  waterType: string;
  coordinate: { latitude: number; longitude: number };
}

interface UseNearestSpotsReturn {
  spots: NearestSpot[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ────────────────────────────────────────────────────────────────
// Yardımcı — Haversine mesafe hesabı (km)
// RPC sıralama için mesafeyi zaten hesaplar ancak yanıtta döndürmez;
// SpotCard etiketini doldurmak için istemci tarafında hesaplıyoruz.
// ────────────────────────────────────────────────────────────────

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────

export function useNearestSpots(
  coords: { latitude: number; longitude: number } | null,
  limit: number = 3,
): UseNearestSpotsReturn {
  const [spots, setSpots] = useState<NearestSpot[]>([]);
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

    async function fetchNearestSpots() {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
        const { latitude: lat, longitude: lng } = coords!;

        const url = `${baseUrl}/fishing-spots/nearest?lat=${lat}&lng=${lng}&limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const rawData = await response.json();

        // Endpoint bir dizi döndürüyor; sarmalı veya direkt diziyi kabul et
        const items: NearestSpotApiItem[] = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : [];

        if (isMounted) {
          setSpots(
            items.map((item, index) => {
              const spotLat = Number(item.center_lat);
              const spotLng = Number(item.center_lng);
              const distKm = haversineKm(lat, lng, spotLat, spotLng);
              return {
                // RPC id döndürmüyor; isim + index ile kararlı anahtar üret
                id: `nearest-${item.name}-${index}`,
                name: item.name,
                distanceLabel: `${distKm.toFixed(1)} km`,
                waterType: item.water_type,
                coordinate: { latitude: spotLat, longitude: spotLng },
              };
            }),
          );
          setIsLoading(false);
        }
      } catch (err) {
        console.log(err);
        if (isMounted) {
          setError("En yakın meralar yüklenemedi. Lütfen tekrar deneyin.");
          setIsLoading(false);
        }
      }
    }

    fetchNearestSpots();

    return () => {
      isMounted = false;
    };
  }, [coords, limit, fetchTrigger]);

  return { spots, isLoading, error, refetch };
}
