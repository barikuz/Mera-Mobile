/**
 * SkeletonBlock — Pulse animasyonlu iskelet yükleyici bloğu.
 * Yükleme durumlarında içerik placeholder'ı olarak kullanılır.
 * className ile boyut ve şekil (rounded, rounded-full vb.) belirlenir.
 */
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface SkeletonBlockProps {
  /** Boyut, şekil ve konum için NativeWind sınıfları (örn. "h-5 w-3/5 rounded-md") */
  className?: string;
}

export default function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`rounded-lg bg-mera-neutral-200 dark:bg-mera-neutral-500 ${className}`}
      style={{ opacity }}
    />
  );
}
