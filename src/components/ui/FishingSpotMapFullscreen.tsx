/**
 * FishingSpotMapFullscreen — Tam ekran harita modal'ı.
 *
 * Bu component, balıkçılık noktalarını (fishing spots) tam ekran bir harita
 * üzerinde gösterir. Modal yapısı sayesinde mevcut ekranın üzerine bindirilir
 * ve kullanıcı geri butonuyla kapatabilir.
 *
 * Özellikler:
 * - Reanimated ile animasyonlu açılış/kapanış geçişleri
 * - Her nokta için Marker ve etrafında Circle overlay
 * - Seçilen nokta için WeatherCard ile hava durumu bilgisi
 * - Loading ve error state'leri için ayrı render'lar
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import MapView, { Callout, Circle, Marker } from "react-native-maps";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/color";
import { MAP_INITIAL_REGION } from "@/constants/map";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFishingSpots, FishingSpot } from "@/hooks/useFishingSpots";
import SpotInfoCard from "./SpotInfoCard";
import WeatherCard from "./WeatherCard";

/**
 * FishingSpotMapFullscreen component'inin prop'ları.
 * @property visible - Modal'ın görünür olup olmadığını kontrol eden boolean
 * @property onClose - Modal kapatıldığında çağrılacak callback fonksiyonu
 * @property animatedOverlayStyle - Overlay için Reanimated animated style
 * @property animatedMapStyle - Harita container'ı için animated style
 * @property animatedBackButtonStyle - Geri butonu için animated style
 */
interface FishingSpotMapFullscreenProps {
  visible: boolean;
  onClose: () => void;
  animatedOverlayStyle: StyleProp<ViewStyle>;
  animatedMapStyle: StyleProp<ViewStyle>;
  animatedBackButtonStyle: StyleProp<ViewStyle>;
}

export default function FishingSpotMapFullscreen({
  visible,
  onClose,
  animatedOverlayStyle,
  animatedMapStyle,
  animatedBackButtonStyle,
}: FishingSpotMapFullscreenProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  // Tema renklerini belirle: Dark/light mode'a göre accent, callout ve text renkleri
  // Bu renkler Marker callout'ları ve WeatherCard için kullanılır
  const accentColor =
    colorScheme === "dark" ? COLORS.dark.iconActive : COLORS.light.iconActive;
  const calloutBackground =
    colorScheme === "dark"
      ? COLORS.dark.tabBarBackground
      : COLORS.light.tabBarBackground;
  const calloutBorder =
    colorScheme === "dark"
      ? COLORS.dark.tabBarBorder
      : COLORS.light.tabBarBorder;
  const calloutSecondaryText =
    colorScheme === "dark"
      ? COLORS.dark.iconInactive
      : COLORS.light.iconInactive;
  const textPrimary =
    colorScheme === "dark" ? "#F8FAFC" : "#192655";

  // useFishingSpots hook'u: Backend'den balıkçılık noktalarını fetch eder
  // spots: FishingSpot[], loading: boolean, error: string | null, refetch: () => void
  const { spots, loading, error, refetch } = useFishingSpots();

  // Hava durumu kartı için state'ler
  // selectedSpot: Kullanıcının tıkladığı marker'ı tutar
  // weatherData: Backend'den gelen hava durumu verisi (sıcaklık, rüzgar, basınç)
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);
  const [weatherData, setWeatherData] = useState<{
    temperature: number;
    windSpeed: number;
    pressure: number;
  } | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Custom backend'den hava durumu verisini fetch eder
  // API endpoint: /weather?lat={lat}&lon={lon}
  // Dönen veri: { temperature, windSpeed, pressure }
  const fetchWeather = async (lat: number, lon: number) => {
    setIsWeatherLoading(true);
    setWeatherError(null);
    setWeatherData(null);

    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "";
      const response = await fetch(`${baseUrl}/weather?lat=${lat}&lon=${lon}`);
      if (!response.ok) throw new Error("Failed to fetch weather");
      const data = await response.json();
      setWeatherData(data);
    } catch {
      setWeatherError("Hava durumu yüklenemedi");
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // Marker'a tıklandığında çalışan handler
  // Seçili spot'u state'e atar ve o nokta için hava durumu fetch'ini başlatır
  const handleMarkerPress = (spot: FishingSpot) => {
    setSelectedSpot(spot);
    fetchWeather(spot.center_lat, spot.center_lng);
  };

  // Hava durumu kartını kapatır ve ilgili state'leri temizler
  const handleCloseWeatherCard = () => {
    setSelectedSpot(null);
    setWeatherData(null);
    setWeatherError(null);
  };

  // Modal her görünür olduğunda fishing spots verisini yeniden fetch eder
  // Modal kapandığında weather kartı state'ini temizler
  useEffect(() => {
    if (visible) {
      refetch();
    } else {
      // Modal kapandığında state'leri sıfırla
      handleCloseWeatherCard();
    }
  }, [visible, refetch]);

  // Loading durumu render'ı: Veriler yüklenirken spinner gösterilir
  if (loading) {
    return (
      <Modal
        visible={visible}
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
      >
        <Animated.View style={[styles.container, animatedOverlayStyle]}>
          <View style={[styles.centerContent, { backgroundColor: calloutBackground }]}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={[styles.loadingText, { color: textPrimary }]}>Meralar yükleniyor...</Text>
          </View>

          <Animated.View
            style={[
              styles.backButtonContainer,
              { top: insets.top + 12 },
              animatedBackButtonStyle,
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

  // Hata durumu render'ı: API hatası olduğunda error mesajı gösterilir
  if (error) {
    return (
      <Modal
        visible={visible}
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
        transparent={true}
        animationType="none"
        onRequestClose={onClose}
      >
        <Animated.View style={[styles.container, animatedOverlayStyle]}>
          <View style={[styles.centerContent, { backgroundColor: calloutBackground }]}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={[styles.errorText, { color: textPrimary }]}>{error}</Text>
          </View>

          <Animated.View
            style={[
              styles.backButtonContainer,
              { top: insets.top + 12 },
              animatedBackButtonStyle,
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

  // Başarılı durum: Harita ve fishing spot marker'ları render edilir
  return (
    <Modal
      visible={visible}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.container, animatedOverlayStyle]}>
        <Animated.View style={[styles.mapContainer, animatedMapStyle]}>
          <MapView
            style={styles.fullscreenMap}
            initialRegion={MAP_INITIAL_REGION}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {/* Her fishing spot için Marker ve Circle overlay render edilir.
                Fragment kullanılmasının sebebi: Aynı key ile birden fazla element döndürmek */}
            {spots.map((spot) => (
              <React.Fragment key={spot.id}>
                <Marker
                  coordinate={{
                    latitude: spot.center_lat,
                    longitude: spot.center_lng,
                  }}
                  title={spot.name}
                  description={spot.water_type}
                  pinColor={accentColor}
                  onPress={() => handleMarkerPress(spot)}
                >
                  <Callout tooltip>
                    <SpotInfoCard
                      spot={spot}
                      accentColor={accentColor}
                      backgroundColor={calloutBackground}
                      borderColor={calloutBorder}
                      secondaryTextColor={calloutSecondaryText}
                    />
                  </Callout>
                </Marker>
                <Circle
                  center={{
                    latitude: spot.center_lat,
                    longitude: spot.center_lng,
                  }}
                  radius={spot.radius_meters || 500}
                  fillColor={`${accentColor}33`}
                  strokeColor={`${accentColor}CC`}
                  strokeWidth={2}
                />
              </React.Fragment>
            ))}
          </MapView>
        </Animated.View>

        <Animated.View
          style={[
            styles.backButtonContainer,
            { top: insets.top + 12 },
            animatedBackButtonStyle,
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Seçili nokta için hava durumu kartı. Marker'a tıklandığında görünür olur */}
        {selectedSpot && (
          <WeatherCard
            selectedSpot={selectedSpot}
            weatherData={weatherData}
            isWeatherLoading={isWeatherLoading}
            weatherError={weatherError}
            onClose={handleCloseWeatherCard}
            onRetry={() => fetchWeather(selectedSpot.center_lat, selectedSpot.center_lng)}
            bottomInset={insets.bottom}
            accentColor={accentColor}
            backgroundColor={calloutBackground}
            borderColor={calloutBorder}
            secondaryTextColor={calloutSecondaryText}
            primaryTextColor={textPrimary}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  fullscreenMap: {
    width: "100%",
    height: "100%",
  },
  backButtonContainer: {
    position: "absolute",
    left: 16,
    zIndex: 1001,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
