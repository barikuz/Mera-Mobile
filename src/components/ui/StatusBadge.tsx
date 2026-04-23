/**
 * StatusBadge — Küçük renkli rozet (pill) bileşeni.
 * Sonuç sayısı, su tipi, ekipman tipi gibi etiketler için kullanılır.
 * Varsayılan olarak accent renk şeması uygulanır; özel renkler prop ile verilebilir.
 */
import React from "react";
import { View } from "react-native";

import Typography from "./Typography";

interface StatusBadgeProps {
  /** Rozet üzerinde gösterilecek metin */
  label: string;
  /** Arka plan NativeWind sınıfı — varsayılan: accent renk şeması */
  bgClass?: string;
  /** Metin NativeWind sınıfı — varsayılan: accent renk şeması */
  textClass?: string;
  /** Ek NativeWind sınıfları (örn. margin) */
  className?: string;
  /** Sol margin değerini kaldırır */
  noMargin?: boolean;
}

const DEFAULT_BG = "bg-mera-primary/10 dark:bg-mera-accent/15";
const DEFAULT_TEXT = "text-mera-primary dark:text-mera-accent";

export default function StatusBadge({
  label,
  bgClass = DEFAULT_BG,
  textClass = DEFAULT_TEXT,
  className = "",
  noMargin = false,
}: StatusBadgeProps) {
  return (
    <View
      className={`rounded-full px-2.5 py-0.5 ${noMargin ? "" : "ml-2"} ${bgClass} ${className}`}
    >
      <Typography
        variant="caption"
        className={`text-xs font-inter-semibold ${textClass}`}
      >
        {label}
      </Typography>
    </View>
  );
}
