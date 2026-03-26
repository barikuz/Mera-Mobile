/**
 * WeatherCard — Seçili fishing spot için floating hava durumu kartı.
 *
 * Bu component, kullanıcı bir marker'a tıkladığında ekranın alt kısmında
 * görünen hava durumu bilgilerini gösterir. Tamamen presentational (stateless)
 * bir component'tir, tüm state ve logic parent'tan (FishingSpotMapFullscreen) gelir.
 *
 * Üç farklı durumu handle eder:
 * - Loading: Spinner ile "Yükleniyor..." mesajı
 * - Error: Hata ikonu, mesaj ve "Tekrar Dene" butonu
 * - Success: Sıcaklık, rüzgar hızı ve basınç metrikleri
 */
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { FishingSpot } from "@/hooks/useFishingSpots";

/**
 * Backend'den dönen hava durumu verisi.
 * Custom backend /weather endpoint'inden alınır.
 *
 * @property temperature - Sıcaklık (Celsius)
 * @property windSpeed - Rüzgar hızı (m/s)
 * @property pressure - Atmosfer basıncı (hPa)
 * @property safetyWarnings - Güvenlik uyarıları listesi (opsiyonel)
 */
export interface WeatherData {
  temperature: number;
  windSpeed: number;
  pressure: number;
  safetyWarnings?: string[];
}

/**
 * WeatherCard component'inin prop'ları.
 * State ve callback'ler parent'tan (FishingSpotMapFullscreen) gelir.
 *
 * @property selectedSpot - Hava durumu gösterilecek fishing spot
 * @property weatherData - Backend'den gelen hava verisi (null ise henüz yüklenmemiş)
 * @property isWeatherLoading - Veri fetch edilirken true
 * @property weatherError - Hata varsa mesaj, yoksa null
 * @property onClose - Kartı kapatma callback'i
 * @property onRetry - Hata durumunda tekrar deneme callback'i
 * @property bottomInset - Safe area bottom inset değeri (notch'lu cihazlar için)
 * @property accentColor - Vurgu rengi (tema bazlı)
 * @property backgroundColor - Kart arka plan rengi
 * @property borderColor - Kart çerçeve rengi
 * @property secondaryTextColor - İkincil metin rengi
 * @property primaryTextColor - Birincil metin rengi (metrik değerleri)
 */
export interface WeatherCardProps {
  selectedSpot: FishingSpot;
  weatherData: WeatherData | null;
  isWeatherLoading: boolean;
  weatherError: string | null;
  onClose: () => void;
  onRetry: () => void;
  bottomInset: number;
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  secondaryTextColor: string;
  primaryTextColor: string;
}

export default function WeatherCard({
  selectedSpot,
  weatherData,
  isWeatherLoading,
  weatherError,
  onClose,
  onRetry,
  bottomInset,
  accentColor,
  backgroundColor,
  borderColor,
  secondaryTextColor,
  primaryTextColor,
}: WeatherCardProps) {
  return (
    <View
      style={[
        styles.weatherCard,
        {
          bottom: bottomInset + 16,
          backgroundColor,
          borderColor,
        },
      ]}
    >
      {/* Kart başlığı: Spot adı ve kapatma butonu */}
      <View style={styles.weatherCardHeader}>
        <Text
          style={[styles.weatherCardTitle, { color: accentColor }]}
          numberOfLines={1}
        >
          {selectedSpot.name}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.weatherCardCloseButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={secondaryTextColor} />
        </TouchableOpacity>
      </View>

      {/* İçerik: Duruma göre loading, error veya weather metrikleri gösterilir */}
      {/* Loading state: Spinner ve "Yükleniyor..." mesajı */}
      {isWeatherLoading ? (
        <View style={styles.weatherCardLoading}>
          <ActivityIndicator size="small" color={accentColor} />
          <Text
            style={[
              styles.weatherCardLoadingText,
              { color: secondaryTextColor },
            ]}
          >
            Yükleniyor...
          </Text>
        </View> /* Error state: Hata ikonu, mesaj ve retry butonu */
      ) : weatherError ? (
        <View style={styles.weatherCardError}>
          <Ionicons name="cloud-offline" size={24} color="#EF4444" />
          <Text style={styles.weatherCardErrorText}>{weatherError}</Text>
          <TouchableOpacity
            onPress={onRetry}
            style={[
              styles.weatherCardRetryButton,
              { borderColor: accentColor },
            ]}
          >
            <Text style={[styles.weatherCardRetryText, { color: accentColor }]}>
              Tekrar Dene
            </Text>
          </TouchableOpacity>
        </View> /* Success state: Hava durumu metrikleri (sıcaklık, rüzgar, basınç) */
      ) : weatherData ? (
        <>
          <View style={styles.weatherCardMetrics}>
            <View style={styles.weatherMetric}>
              <Ionicons name="thermometer-outline" size={24} color="#F97316" />
              <Text
                style={[styles.weatherMetricValue, { color: primaryTextColor }]}
              >
                {weatherData.temperature}°C
              </Text>
              <Text
                style={[
                  styles.weatherMetricLabel,
                  { color: secondaryTextColor },
                ]}
              >
                Sıcaklık
              </Text>
            </View>
            <View style={styles.weatherMetric}>
              <Ionicons name="speedometer-outline" size={24} color="#0EA5E9" />
              <Text
                style={[styles.weatherMetricValue, { color: primaryTextColor }]}
              >
                {weatherData.windSpeed} m/s
              </Text>
              <Text
                style={[
                  styles.weatherMetricLabel,
                  { color: secondaryTextColor },
                ]}
              >
                Rüzgar
              </Text>
            </View>
            <View style={styles.weatherMetric}>
              <Ionicons name="analytics-outline" size={24} color="#8B5CF6" />
              <Text
                style={[styles.weatherMetricValue, { color: primaryTextColor }]}
              >
                {weatherData.pressure} hPa
              </Text>
              <Text
                style={[
                  styles.weatherMetricLabel,
                  { color: secondaryTextColor },
                ]}
              >
                Basınç
              </Text>
            </View>
          </View>

          {/* Güvenlik uyarıları varsa listele. Her uyarı için dikkat çekici bir badge render edilir */}
          {weatherData.safetyWarnings &&
            weatherData.safetyWarnings.length > 0 && (
              <View style={styles.safetyWarningsContainer}>
                {weatherData.safetyWarnings.map((warning, index) => (
                  <View key={index} style={styles.safetyWarningBadge}>
                    <Ionicons name="warning" size={16} color="#B45309" />
                    <Text style={styles.safetyWarningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  weatherCard: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 1002,
    // iOS için gölge efekti (shadowColor, shadowOffset, shadowOpacity, shadowRadius)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    // Android için elevation (gölge)
    elevation: 8,
  },
  weatherCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  weatherCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  weatherCardCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  weatherCardLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  weatherCardLoadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  weatherCardError: {
    alignItems: "center",
    paddingVertical: 12,
  },
  weatherCardErrorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
  weatherCardRetryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  weatherCardRetryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  weatherCardMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  weatherMetric: {
    alignItems: "center",
    flex: 1,
  },
  weatherMetricValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  weatherMetricLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  // Güvenlik uyarıları container'ı: Metriklerin altında, üst margin ile ayrılmış
  safetyWarningsContainer: {
    marginTop: 12,
    gap: 8,
  },
  // Güvenlik uyarısı badge'i: Amber/sarı tonlarında dikkat çekici kutu
  safetyWarningBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  // Uyarı metni: Koyu amber rengi ile okunabilirlik sağlanır
  safetyWarningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#92400E",
    lineHeight: 18,
  },
});
