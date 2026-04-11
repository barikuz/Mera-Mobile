/**
 * FishingSpotMapPreview — Dokunulabilir küçük harita önizlemesi.
 * Dokunulduğunda onPress callback'i tetiklenir.
 * Tap ve drag/swipe'ı ayırt etmek için basınç mesafesi kontrol edilir.
 */
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { type Region } from "react-native-maps";

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
  initialRegion?: Region;
}

export default function FishingSpotMapPreview({
  onPress,
  initialRegion,
}: FishingSpotMapPreviewProps) {
  // Tap/drag detection hook'unu kullan
  const { handlePressIn, handlePressOut } = useTapDetection(onPress, 10);
  const resolvedRegion = initialRegion ?? MAP_INITIAL_REGION;

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      className="h-48 rounded-xl overflow-hidden"
    >
      <View style={styles.container}>
        <MapView
          key={`${resolvedRegion.latitude}-${resolvedRegion.longitude}`}
          style={styles.map}
          initialRegion={resolvedRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
        />
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
