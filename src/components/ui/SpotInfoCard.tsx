/**
 * SpotInfoCard — Harita marker'ı için callout içeriği.
 *
 * Bu component, bir fishing spot marker'ına tıklandığında açılan
 * bilgi balonunun (callout) içeriğini render eder. Tamamen presentational
 * (stateless) bir component'tir, kendi state'i yoktur.
 *
 * Gösterilen bilgiler:
 * - Spot adı (name)
 * - Su tipi (water_type: göl, nehir, deniz vb.)
 * - Açıklama (description) - varsa, scroll edilebilir
 * - Derinlik bilgisi (min_depth, max_depth) - varsa
 */
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { FishingSpot } from "@/hooks/useFishingSpots";

/**
 * SpotInfoCard component'inin prop'ları.
 * Tüm renkler parent component'ten (FishingSpotMapFullscreen) geçirilir,
 * böylece tema (dark/light mode) tutarlılığı sağlanır.
 *
 * @property spot - Gösterilecek fishing spot verisi
 * @property accentColor - Başlık ve vurgu rengi (tema bazlı)
 * @property backgroundColor - Kart arka plan rengi
 * @property borderColor - Kart çerçeve rengi
 * @property secondaryTextColor - Alt bilgiler için ikincil metin rengi
 */
export interface SpotInfoCardProps {
  spot: FishingSpot;
  accentColor: string;
  backgroundColor: string;
  borderColor: string;
  secondaryTextColor: string;
}

export default function SpotInfoCard({
  spot,
  accentColor,
  backgroundColor,
  borderColor,
  secondaryTextColor,
}: SpotInfoCardProps) {
  // View container: Callout boyutu ve stilini belirler
  return (
    <View
      style={[
        styles.calloutContainer,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <Text style={[styles.calloutTitle, { color: accentColor }]}>
        {spot.name}
      </Text>
      <Text style={[styles.calloutMeta, { color: secondaryTextColor }]}>
        {spot.water_type}
      </Text>

      {/* Açıklama varsa ScrollView içinde göster (uzun metinler için scroll desteği) */}
      {spot.description ? (
        <ScrollView style={styles.calloutScroll} nestedScrollEnabled>
          <Text
            style={[styles.calloutDescription, { color: secondaryTextColor }]}
          >
            {spot.description}
          </Text>
        </ScrollView>
      ) : null}

      {/* Derinlik bilgisi conditional render:
          - Her ikisi de varsa: "min - max metre" formatında
          - Sadece min varsa: "Minimum Derinlik: X metre"
          - Sadece max varsa: "Maksimum Derinlik: X metre"
          - Hiçbiri yoksa: render etme */}
      {spot.min_depth !== null && spot.max_depth !== null ? (
        <Text style={[styles.calloutDepth, { color: secondaryTextColor }]}>
          {spot.min_depth} - {spot.max_depth} metre
        </Text>
      ) : spot.min_depth !== null ? (
        <Text style={[styles.calloutDepth, { color: secondaryTextColor }]}>
          Minimum Derinlik: {spot.min_depth} metre
        </Text>
      ) : spot.max_depth !== null ? (
        <Text style={[styles.calloutDepth, { color: secondaryTextColor }]}>
          Maksimum Derinlik: {spot.max_depth} metre
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
