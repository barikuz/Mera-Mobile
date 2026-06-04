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
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
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
import MapView, {
  Callout,
  Circle,
  MapPressEvent,
  Marker,
} from "react-native-maps";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/color";
import { MAP_INITIAL_REGION } from "@/constants/map";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FishingSpot, useFishingSpots } from "@/hooks/useFishingSpots";
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
  onConfirmSelection?: () => void;
  animatedOverlayStyle: StyleProp<ViewStyle>;
  animatedMapStyle: StyleProp<ViewStyle>;
  animatedBackButtonStyle: StyleProp<ViewStyle>;
  mode?: "spots" | "coordinate";
  selectedCoordinate?: {
    latitude: number;
    longitude: number;
  } | null;
  readOnlyCoordinate?: boolean;
  onCoordinateSelect?: (coordinate: {
    latitude: number;
    longitude: number;
  }) => void;
}

export default function FishingSpotMapFullscreen({
  visible,
  onClose,
  onConfirmSelection,
  animatedOverlayStyle,
  animatedMapStyle,
  animatedBackButtonStyle,
  mode = "spots",
  selectedCoordinate = null,
  readOnlyCoordinate = false,
  onCoordinateSelect,
}: FishingSpotMapFullscreenProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isCoordinateMode = mode === "coordinate";
  const allowCoordinateSelection = isCoordinateMode && !readOnlyCoordinate;

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
  const textPrimary = colorScheme === "dark" ? "#F8FAFC" : "#192655";
  const resolvedRegion = selectedCoordinate ?? MAP_INITIAL_REGION;

  // useFishingSpots hook'u: Backend'den balıkçılık noktalarını fetch eder
  // spots: FishingSpot[], loading: boolean, error: string | null, refetch: () => void
  const { spots, loading, error, refetch } = useFishingSpots(!isCoordinateMode);

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
  const [isLocatingCurrentPosition, setIsLocatingCurrentPosition] =
    useState(false);
  const mapRef = useRef<MapView>(null);

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

  const handleMapPress = (event: MapPressEvent) => {
    if (!allowCoordinateSelection || !onCoordinateSelect) {
      return;
    }

    onCoordinateSelect(event.nativeEvent.coordinate);
  };

  const handleUseCurrentLocation = async () => {
    if (!allowCoordinateSelection || !onCoordinateSelect) {
      return;
    }

    setIsLocatingCurrentPosition(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      onCoordinateSelect({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      });
      mapRef.current?.animateToRegion({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } finally {
      setIsLocatingCurrentPosition(false);
    }
  };

  // Modal her görünür olduğunda fishing spots verisini yeniden fetch eder
  // Modal kapandığında weather kartı state'ini temizler
  useEffect(() => {
    if (visible && !isCoordinateMode) {
      refetch();
    } else {
      // Modal kapandığında state'leri sıfırla
      handleCloseWeatherCard();
    }
  }, [visible, refetch, isCoordinateMode]);

  // Loading durumu render'ı: Veriler yüklenirken spinner gösterilir
  if (!isCoordinateMode && loading) {
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
          <View
            style={[
              styles.centerContent,
              { backgroundColor: calloutBackground },
            ]}
          >
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={[styles.loadingText, { color: textPrimary }]}>
              Meralar yükleniyor...
            </Text>
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
  if (!isCoordinateMode && error) {
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
          <View
            style={[
              styles.centerContent,
              { backgroundColor: calloutBackground },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={[styles.errorText, { color: textPrimary }]}>
              {error}
            </Text>
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
  const mapInitialRegion = selectedCoordinate
    ? {
        latitude: selectedCoordinate.latitude,
        longitude: selectedCoordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : MAP_INITIAL_REGION;

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
            ref={mapRef}
            style={styles.fullscreenMap}
            initialRegion={mapInitialRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            toolbarEnabled={false}
            onPress={allowCoordinateSelection ? handleMapPress : undefined}
          >
            {/* Her fishing spot için Marker ve Circle overlay render edilir.
                Fragment kullanılmasının sebebi: Aynı key ile birden fazla element döndürmek */}
            {!isCoordinateMode
              ? spots.map((spot) => (
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
                ))
              : null}

            {isCoordinateMode && selectedCoordinate ? (
              <Marker coordinate={selectedCoordinate} pinColor={accentColor} />
            ) : null}
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

        {allowCoordinateSelection ? (
          <View
            style={[styles.currentLocationContainer, { top: insets.top + 12 }]}
          >
            <TouchableOpacity
              onPress={handleUseCurrentLocation}
              style={[
                styles.currentLocationButton,
                {
                  backgroundColor: calloutBackground,
                  borderColor: calloutBorder,
                },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons
                name="navigate"
                size={20}
                color={
                  isLocatingCurrentPosition ? calloutSecondaryText : accentColor
                }
              />
              <Text
                style={[
                  styles.currentLocationButtonText,
                  { color: textPrimary },
                ]}
              >
                {isLocatingCurrentPosition
                  ? "Konum Alınıyor"
                  : "Konumumu Kullan"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {allowCoordinateSelection ? (
          <View
            style={[styles.saveButtonContainer, { bottom: insets.bottom + 96 }]}
          >
            <TouchableOpacity
              onPress={onConfirmSelection}
              style={[
                styles.saveButton,
                {
                  backgroundColor: selectedCoordinate
                    ? accentColor
                    : calloutBackground,
                  borderColor: selectedCoordinate ? accentColor : calloutBorder,
                },
              ]}
              activeOpacity={0.8}
              disabled={!selectedCoordinate || !onConfirmSelection}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color: selectedCoordinate
                      ? colorScheme === "dark"
                        ? COLORS.dark.tabBarBackground
                        : COLORS.light.tabBarBackground
                      : calloutSecondaryText,
                  },
                ]}
              >
                Kaydet
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {allowCoordinateSelection ? (
          <View
            style={[
              styles.selectionHintContainer,
              {
                backgroundColor: calloutBackground,
                borderColor: calloutBorder,
                bottom: insets.bottom + 24,
              },
            ]}
          >
            <Text style={[styles.selectionHintText, { color: textPrimary }]}>
              Haritada bir noktaya dokunun ya da mevcut konumunuzu kullanın.
            </Text>
          </View>
        ) : null}

        {/* Seçili nokta için hava durumu kartı. Marker'a tıklandığında görünür olur */}
        {!isCoordinateMode && selectedSpot && (
          <WeatherCard
            selectedSpot={selectedSpot}
            weatherData={weatherData}
            isWeatherLoading={isWeatherLoading}
            weatherError={weatherError}
            onClose={handleCloseWeatherCard}
            onRetry={() =>
              fetchWeather(selectedSpot.center_lat, selectedSpot.center_lng)
            }
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
  currentLocationContainer: {
    position: "absolute",
    right: 16,
    zIndex: 1001,
  },
  saveButtonContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 1002,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  currentLocationButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  selectionHintContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectionHintText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter-Regular",
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
