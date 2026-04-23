/**
 * SectionHeader — Bölüm başlığı bileşeni.
 * İkon + başlık satırı, opsiyonel alt açıklama ve opsiyonel inline rozet içerir.
 *
 * İki varyantı vardır:
 *   • section    → h2 başlık, isteğe bağlı alt açıklama (ana bölüm başlıkları için)
 *   • subsection → body semibold başlık, isteğe bağlı inline rozet (sonuç başlıkları için)
 */
import React, { ReactNode } from "react";
import { View } from "react-native";

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
}

export default function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
  variant = "section",
  className = "mb-4",
}: SectionHeaderProps) {
  const isSection = variant === "section";

  return (
    <View className={className}>
      <View className={`flex-row items-center ${subtitle ? "mb-2" : ""}`}>
        {icon}
        <Typography
          variant={isSection ? "h2" : "body"}
          className={isSection ? "ml-2" : "ml-1.5 font-inter-semibold"}
        >
          {title}
        </Typography>
        {badge && <StatusBadge label={badge} className="ml-2" noMarginBottom />}
      </View>

      {subtitle && <Typography variant="caption">{subtitle}</Typography>}
    </View>
  );
}
