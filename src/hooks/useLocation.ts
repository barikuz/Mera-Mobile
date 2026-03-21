/**
 * useLocation — Kullanıcının mevcut konumunu alır ve şehir/ilçe bilgisini döndürür.
 * Expo Location ile foreground izni ister, ters geocoding yapar.
 */
import * as Location from "expo-location";
import { useEffect, useState } from "react";

interface LocationState {
  /** Konum adı (örn. "Kadıköy, İstanbul") */
  locationName: string | null;
  /** Konum alınırken yükleniyor mu? */
  isLoading: boolean;
  /** Kullanıcı izin vermedi mi? */
  permissionDenied: boolean;
  /** Hata mesajı (varsa) */
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    locationName: null,
    isLoading: true,
    permissionDenied: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchLocation() {
      try {
        // Foreground izni iste
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          if (isMounted) {
            setState({
              locationName: null,
              isLoading: false,
              permissionDenied: true,
              error: null,
            });
          }
          return;
        }

        // Düşük doğrulukla konum al (daha hızlı)
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        // Ters geocoding ile adres bilgisi al
        const [address] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (isMounted && address) {
          const district = address.subregion || address.district || "";
          const city = address.city || address.region || "";
          const locationName =
            district && city
              ? `${district}, ${city}`
              : city || district || "Konum bulunamadı";

          setState({
            locationName,
            isLoading: false,
            permissionDenied: false,
            error: null,
          });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            locationName: null,
            isLoading: false,
            permissionDenied: false,
            error: "Konum alınamadı",
          });
        }
      }
    }

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
