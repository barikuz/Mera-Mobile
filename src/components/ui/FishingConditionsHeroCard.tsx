/**
 * FishingConditionsHeroCard — Ana sayfa hero kartı: av koşulları özeti.
 * Gradient arka plan, animasyonlu durum göstergesi ve hava metrikleri içerir.
 * Ana sayfa ekranının görsel merkez noktası olarak tasarlanmıştır.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

import Typography from "./Typography";

type ConditionsStatus = "good" | "okay" | "poor";

interface ConditionsData {
  status: ConditionsStatus;
  temperature: number;
  windSpeed: number;
  pressure: number;
  summary: string;
}

interface FishingConditionsHeroCardProps {
  /** Av koşulları verileri */
  conditions: ConditionsData;
}

const STATUS_CONFIG: Record<
  ConditionsStatus,
  {
    label: string;
    statusLabel: string;
    glowColor: string;
    iconName: "checkmark-circle" | "alert-circle" | "close-circle";
  }
> = {
  good: {
    label: "Yüksek",
    statusLabel: "Balık Aktivitesi Yüksek",
    glowColor: "#10B981",
    iconName: "checkmark-circle",
  },
  okay: {
    label: "Orta",
    statusLabel: "Orta Seviye Aktivite",
    glowColor: "#F59E0B",
    iconName: "alert-circle",
  },
  poor: {
    label: "Düşük",
    statusLabel: "Aktivite Düşük",
    glowColor: "#EF4444",
    iconName: "close-circle",
  },
};

const METRICS = [
  {
    key: "temperature" as const,
    label: "Sıcaklık",
    icon: "thermometer-outline" as const,
    iconColor: "#F97316",
    unit: "°C",
  },
  {
    key: "windSpeed" as const,
    label: "Rüzgar",
    icon: "speedometer-outline" as const,
    iconColor: "#0EA5E9",
    unit: " m/s",
  },
  {
    key: "pressure" as const,
    label: "Basınç",
    icon: "analytics-outline" as const,
    iconColor: "#8B5CF6",
    unit: " hPa",
  },
];

export default function FishingConditionsHeroCard({
  conditions,
}: FishingConditionsHeroCardProps) {
  const config = STATUS_CONFIG[conditions.status];
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  // Durum göstergesi için nabız animasyonu
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View className="overflow-hidden rounded-3xl">
      <LinearGradient
        colors={["#192655", "#1a3a5c", "#0d4a4a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        {/* Üst satır: Durum etiketi ve göstergesi */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <View className="mb-1 flex-row items-center">
              <MaterialCommunityIcons
                name="weather-partly-cloudy"
                size={18}
                color="rgba(255,255,255,0.6)"
              />
              <Typography
                variant="caption"
                className="ml-1.5 text-xs text-white/60"
              >
                Konum Bazlı Güncel Av Koşulları
              </Typography>
            </View>
            <Typography variant="h2" className="text-lg text-white">
              {config.statusLabel}
            </Typography>
          </View>

          {/* Animasyonlu durum göstergesi */}
          <View className="items-center">
            <Animated.View
              style={{
                opacity: pulseAnim,
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${config.glowColor}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${config.glowColor}30` }}
              >
                <Ionicons
                  name={config.iconName}
                  size={24}
                  color={config.glowColor}
                />
              </View>
            </Animated.View>
            <Typography
              variant="caption"
              className="mt-1 text-xs font-inter-semibold"
              style={{ color: config.glowColor }}
            >
              {config.label}
            </Typography>
          </View>
        </View>

        {/* Özet metni */}
        <Typography variant="caption" className="mb-4 text-sm text-white/70">
          {conditions.summary}
        </Typography>

        {/* Metrik satırı */}
        <View className="flex-row">
          {METRICS.map((metric, index) => (
            <View
              key={metric.key}
              className={`flex-1 items-center rounded-2xl bg-white/10 py-3 ${index < METRICS.length - 1 ? "mr-2" : ""}`}
            >
              <Ionicons name={metric.icon} size={20} color={metric.iconColor} />
              <Typography variant="h2" className="mt-1.5 text-base text-white">
                {conditions[metric.key]}
                {metric.unit}
              </Typography>
              <Typography
                variant="caption"
                className="mt-0.5 text-xs text-white/50"
              >
                {metric.label}
              </Typography>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}
