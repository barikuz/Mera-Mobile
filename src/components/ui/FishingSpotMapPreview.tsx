/**
 * FishingSpotMapPreview — Dokunulabilir küçük harita önizlemesi.
 * Dokunulduğunda onPress callback'i tetiklenir.
 */
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import MapView from "react-native-maps";

import { MAP_INITIAL_REGION } from "@/constants/map";

interface FishingSpotMapPreviewProps {
  onPress: () => void;
}

export default function FishingSpotMapPreview({
  onPress,
}: FishingSpotMapPreviewProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="h-48 rounded-xl overflow-hidden"
    >
      <View style={styles.container}>
        <MapView style={styles.map} initialRegion={MAP_INITIAL_REGION} />
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
