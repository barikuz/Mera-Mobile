/**
 * FishingSpotMapFullscreen — Tam ekran harita modal'ı.
 * Geri butonu ile kapatılabilir, animasyonlu geçişler desteklenir.
 * Modal ile gerçek tam ekran kapsama sağlanır.
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
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
import { useFishingSpots } from "@/hooks/useFishingSpots";

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
  const { spots, loading, error, refetch } = useFishingSpots();

  // Re-fetch data every time the modal becomes visible
  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);

  // Loading state
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
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.loadingText}>Meralar yükleniyor...</Text>
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

  // Error state
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
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
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

  // Success state with map
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
                >
                  <Callout tooltip>
                    <View
                      style={[
                        styles.calloutContainer,
                        {
                          backgroundColor: calloutBackground,
                          borderColor: calloutBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.calloutTitle, { color: accentColor }]}
                      >
                        {spot.name}
                      </Text>
                      <Text
                        style={[
                          styles.calloutMeta,
                          { color: calloutSecondaryText },
                        ]}
                      >
                        {spot.water_type}
                      </Text>

                      {spot.description ? (
                        <ScrollView
                          style={styles.calloutScroll}
                          nestedScrollEnabled
                        >
                          <Text
                            style={[
                              styles.calloutDescription,
                              { color: calloutSecondaryText },
                            ]}
                          >
                            {spot.description}
                          </Text>
                        </ScrollView>
                      ) : null}

                      {spot.min_depth !== null && spot.max_depth !== null ? (
                        <Text
                          style={[
                            styles.calloutDepth,
                            { color: calloutSecondaryText },
                          ]}
                        >
                          {spot.min_depth} - {spot.max_depth} metre
                        </Text>
                      ) : spot.min_depth !== null ? (
                        <Text
                          style={[
                            styles.calloutDepth,
                            { color: calloutSecondaryText },
                          ]}
                        >
                          Minimum Derinlik: {spot.min_depth} metre
                        </Text>
                      ) : spot.max_depth !== null ? (
                        <Text
                          style={[
                            styles.calloutDepth,
                            { color: calloutSecondaryText },
                          ]}
                        >
                          Maksimum Derinlik: {spot.max_depth} metre
                        </Text>
                      ) : null}
                    </View>
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
    backgroundColor: "#0F162A",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#F8FAFC",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#F8FAFC",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  calloutContainer: {
    width: 260,
    maxWidth: 280,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  calloutMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  calloutScroll: {
    maxHeight: 96,
    marginTop: 8,
  },
  calloutDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  calloutDepth: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: "600",
  },
});
