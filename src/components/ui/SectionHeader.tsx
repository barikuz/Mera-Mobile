/**
 * SectionHeader — Bölüm başlığı bileşeni.
 * İkon + başlık satırı, opsiyonel alt açıklama ve opsiyonel inline rozet içerir.
 * İsteğe bağlı "Tümünü gör" aksiyon bağlantısı destekler.
 *
 * İki varyantı vardır:
 *   • section    → h2 başlık, isteğe bağlı alt açıklama (ana bölüm başlıkları için)
 *   • subsection → body semibold başlık, isteğe bağlı inline rozet (sonuç başlıkları için)
 */
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { TouchableOpacity, useColorScheme, View } from "react-native";

import StatusBadge from "./StatusBadge";
import Typography from "./Typography";

interface SectionHeaderProps {
  /** Başlığın solunda gösterilecek ikon */
  icon: ReactNode;
  /** Başlık metni */
  title: string;
  /** Başlık satırının altında gösterilecek açıklama metni (section varyantı) */
  subtitle?: string;
  /** Başlığın yanında gösterilecek rozet metni (subsection varyantı) */
  badge?: string;
  /** 'section' = h2 başlık, 'subsection' = body semibold + inline rozet */
  variant?: "section" | "subsection";
  /** Dış sarmalayıcıya ek NativeWind sınıfları */
  className?: string;
  /** Aksiyon bağlantısı metni (örn. "Tümünü gör") */
  actionLabel?: string;
  /** Aksiyon bağlantısına basıldığında çağrılacak fonksiyon */
  onAction?: () => void;
}

export default function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
  variant = "section",
  className = "mb-4",
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  const isSection = variant === "section";
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className={className}>
      <View className="flex-row items-center justify-between">
        <View className={`flex-row items-center ${subtitle ? "" : ""}`}>
          {/* İkon alanı — yumuşak arka plan */}
          <View
            className="mr-2.5 h-8 w-8 items-center justify-center rounded-lg"
            style={{
              backgroundColor: isDark
                ? "rgba(0,204,178,0.12)"
                : "rgba(25,38,85,0.08)",
            }}
          >
            {icon}
          </View>
          <Typography
            variant={isSection ? "h2" : "body"}
            className={isSection ? "" : "font-inter-semibold"}
          >
            {title}
          </Typography>
          {badge && (
            <StatusBadge label={badge} className="ml-2" noMarginBottom />
          )}
        </View>

        {/* Aksiyon bağlantısı */}
        {actionLabel && onAction && (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.7}
            className="flex-row items-center"
          >
            <Typography
              variant="caption"
              className="mr-1 text-xs font-inter-semibold text-mera-primary dark:text-mera-accent"
            >
              {actionLabel}
            </Typography>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={isDark ? "#00ccb2" : "#192655"}
            />
          </TouchableOpacity>
        )}
      </View>

      {subtitle && (
        <Typography variant="caption" className="mt-3 ">
          {subtitle}
        </Typography>
      )}
    </View>
  );
}
