/**
 * FishingSpotMapPreview — Dokunulabilir küçük harita önizlemesi.
 * Dokunulduğunda onPress callback'i tetiklenir.
 * Tap ve drag/swipe'ı ayırt etmek için basınç mesafesi kontrol edilir.
 */
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { MAP_INITIAL_REGION } from "@/constants/map";

// Tap ve drag'ı ayırt eden hook — basınç mesafesine göre işlem yapar
function useTapDetection(onTap: () => void, threshold: number = 10) {
  const [pressStart, setPressStart] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handlePressIn = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setPressStart({ x: pageX, y: pageY });
  };

  const handlePressOut = (event: any) => {
    if (!pressStart) return;

    const { pageX, pageY } = event.nativeEvent;
    // Parmakın ne kadar hareket ettiğini hesapla
    const distance = Math.sqrt(
      Math.pow(pageX - pressStart.x, 2) + Math.pow(pageY - pressStart.y, 2),
    );

    // Threshold'dan az hareket ise, saf tap — callback'i çağır
    if (distance < threshold) {
      onTap();
    }

    setPressStart(null);
  };

  return { handlePressIn, handlePressOut };
}

interface FishingSpotMapPreviewProps {
  onPress: () => void;
  selectedCoordinate?: {
    latitude: number;
    longitude: number;
  } | null;
  containerClassName?: string;
  showsUserLocation?: boolean;
}

export default function FishingSpotMapPreview({
  onPress,
  selectedCoordinate = null,
  containerClassName = "h-48 rounded-xl overflow-hidden",
  showsUserLocation = true,
}: FishingSpotMapPreviewProps) {
  // Tap/drag detection hook'unu kullan
  const { handlePressIn, handlePressOut } = useTapDetection(onPress, 10);

  const initialRegion = selectedCoordinate
    ? {
        latitude: selectedCoordinate.latitude,
        longitude: selectedCoordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : MAP_INITIAL_REGION;

  const resolvedRegion = initialRegion ?? MAP_INITIAL_REGION;

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      className={containerClassName}
    >
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={initialRegion}
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          liteMode={true}
          cacheEnabled={true}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {selectedCoordinate ? (
            <Marker coordinate={selectedCoordinate} />
          ) : null}
        </MapView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 12,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
