/**
 * useLocation — Kullanıcının mevcut konumunu alır ve şehir/ilçe bilgisini döndürür.
 * Expo Location ile foreground izni ister, ters geocoding yapar.
 *
 * Kullanım yerleri:
 * - Asistan ekranında (src/app/assistant.tsx) harita marker'si için koordinat sağlar
 * - Ana sayfa (src/app/index.tsx) konum bilgisini metin olarak gösterir
 * - Harita bileşenlerinde (FishingSpotMapPreview, FishingSpotMapFullscreen) kırmızı kullanıcı marker'ı gösterir
 *
 * Not: Cache mekanizması ile uygulamada sürekli konum isteklerini önler.
 */
import * as Location from "expo-location";
import { useEffect, useState } from "react";

// Hook'un döndüreceği konum durumu — isim, koordinat, loading, izin ve hata bilgilerini içerir
interface LocationState {
  /** Konum adı (örn. "Kadıköy, İstanbul") */
  locationName: string | null;
  /** Cihaz koordinatı (varsa) */
  coords: {
    latitude: number;
    longitude: number;
  } | null;
  /** Konum alınırken yükleniyor mu? */
  isLoading: boolean;
  /** Kullanıcı izin vermedi mi? */
  permissionDenied: boolean;
  /** Hata mesajı (varsa) */
  error: string | null;
}

// Global cache — hook çakışmasını ve yinelenen konum isteklerini önler.
// Uygulama ömrü boyunca ilk çekilen konum verisi tüm hook instanslarında paylaşılır.
let cachedLocationState: LocationState | null = null;

export function useLocation() {
  // Konum durumunun başlangıç değeri — ilk render'da hiçbir veri henüz yok, yükleniyor durumundadır
  const [state, setState] = useState<LocationState>({
    locationName: null, // Ters geocoding sonucu şehir/ilçe adı
    coords: null, // Cihazın GPS koordinatları (harita marker'ları için)
    isLoading: true, // İşlem başlangıçta yükleniyor
    permissionDenied: false, // Kullanıcı izin vermedi mi?
    error: null, // İşlem sırasında hata oluştu mu?
  });

  // Konum verisi sadece bir kere çekilir; sonrası cache'ten sağlanır
  useEffect(() => {
    // Konum zaten bir önceki çağrıda başarıyla getirildi ise, tekrar istek yapma — cache'ten al
    if (cachedLocationState) {
      setState(cachedLocationState);
      return; // Orijinal fetchLocation() tetiklemesini atla
    }

    // Component unmount'dan sonra state güncellenmesini önlemek için flag
    let isMounted = true;

    // Konum ve adres bilgisini arka planda asynchronously çeken fonksiyon
    async function fetchLocation() {
      try {
        // Adım 1: Kullanıcıdan konum erişim izni iste (uygulamada aktif iken)
        const { status } = await Location.requestForegroundPermissionsAsync();

        // İzin verilmediyse konum alınamaz — kullanıcıya haber ver ve çık
        if (status !== "granted") {
          // İzin verilmediyse, durumu cache'le ve UI'ı güncelle (mount kontrol ile güvenli)
          if (isMounted) {
            const deniedState: LocationState = {
              locationName: null,
              coords: null,
              isLoading: false,
              permissionDenied: true, // Kullanıcı izin vermediğini işaretle
              error: null,
            };
            cachedLocationState = deniedState; // Gelecek çağrılar için cache'le
            setState(deniedState); // UI'ı güncelle
          }
          return; // Daha ileri işlem yapma
        }

        // Adım 2: Cihazın GPS konumunu al (düşük doğruluk = daha hızlı, pil tasarrufu)
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        // Adım 3: Koordinatları şehir/ilçe bilgisine dönüştür (ters geocoding)
        // Harita marker'ları için koordinat gerekir, UI'da göstermek için isim gerekir
        const [address] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (isMounted && address) {
          // İçerik farklı cihazlara göre farklı alanlar kullanabilir (subregion vs district)
          const district = address.subregion || address.district || "";
          const city = address.city || address.region || "";
          // İlçe + şehir veya ne varsa göster (fallback zinciri)
          const locationName =
            district && city
              ? `${district}, ${city}`
              : city || district || "Konum bulunamadı";

          // Başarılı konum veri paketi — hem isim hem koordinat içerir
          const resolvedState: LocationState = {
            locationName, // UI metni için "Kadıköy, İstanbul"
            coords: {
              // Harita marker'ları için GPS koordinatı
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            isLoading: false, // Yükleme tamamlandı
            permissionDenied: false, // Hata yoktu
            error: null, // Sorun çıkmadı
          };
          cachedLocationState = resolvedState; // Gelecek çağrılar için cache'le
          setState(resolvedState); // UI'ı başarılı durumla güncelle
        }
      } catch (err) {
        // Konum, izin veya reverse geocoding sırasında hata oluştu
        if (isMounted) {
          const errorState: LocationState = {
            locationName: null, // Veri alınamadı
            coords: null, // Koordinat alınamadı
            isLoading: false, // Yükleme sonlandı (hata ile)
            permissionDenied: false, // Hata izin ile alakalı değil (başka sebep)
            error: "Konum alınamadı", // Kullanıcıya göstermek için hata mesajı
          };
          cachedLocationState = errorState; // Sonuç cache'le (sonraki çağrılarda hızlı başarısızlık)
          setState(errorState); // UI'ı hata durumu ile güncelle
        }
      }
    }

    // Async konum işlemini başlat
    fetchLocation();

    // Cleanup: Component unmount olunca isMounted = false yap, çevrimiçi state update'leri atla
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency — konum hook'u uygulamanın başında yalnızca bir kere çalışır

  // Hook'un tüm durumunu döndür (isim, koordinat, loading, izin, hata bilgileri)
  return state;
}
