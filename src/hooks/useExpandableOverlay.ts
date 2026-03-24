/**
 * useExpandableOverlay — Genişleyebilir overlay animasyonlarını yönetir.
 * Açılma/kapanma durumunu ve animasyonlu stilleri sağlar.
 */
import { useState } from "react";
import {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface ExpandableOverlayConfig {
  /** Genişleme animasyonu süresi (ms) */
  expandDuration?: number;
  /** Daraltma animasyonu süresi (ms) */
  collapseDuration?: number;
}

const DEFAULT_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

export function useExpandableOverlay(config: ExpandableOverlayConfig = {}) {
  const { expandDuration = 350, collapseDuration = 300 } = config;

  const [isExpanded, setIsExpanded] = useState(false);
  const progress = useSharedValue(0);

  const expand = () => {
    setIsExpanded(true);
    progress.value = withTiming(1, {
      duration: expandDuration,
      easing: DEFAULT_EASING,
    });
  };

  const collapse = () => {
    progress.value = withTiming(
      0,
      {
        duration: collapseDuration,
        easing: DEFAULT_EASING,
      },
      () => {
        runOnJS(setIsExpanded)(false);
      },
    );
  };

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const animatedMapStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(progress.value, [0, 1], [12, 0]),
  }));

  const animatedBackButtonStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.8, 1]) }],
  }));

  return {
    isExpanded,
    expand,
    collapse,
    animatedOverlayStyle,
    animatedMapStyle,
    animatedBackButtonStyle,
  };
}
