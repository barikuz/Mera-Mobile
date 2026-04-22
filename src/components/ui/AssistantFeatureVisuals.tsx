import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  Pattern,
  Rect,
} from "react-native-svg";

interface VisualProps {
  accentColor: string;
  isDark: boolean;
}

export function LiveRadarVisual({ accentColor, isDark }: VisualProps) {
  const ringOne = useRef(new Animated.Value(0)).current;
  const ringTwo = useRef(new Animated.Value(0)).current;
  const ringThree = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const loops: Animated.CompositeAnimation[] = [];

    const startRing = (value: Animated.Value, delay: number) => {
      const timer = setTimeout(() => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 1900,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.delay(500),
          ]),
        );

        loops.push(loop);
        loop.start();
      }, delay);

      timers.push(timer);
    };

    startRing(ringOne, 0);
    startRing(ringTwo, 520);
    startRing(ringThree, 1040);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      loops.forEach((loop) => loop.stop());
      ringOne.stopAnimation();
      ringTwo.stopAnimation();
      ringThree.stopAnimation();
    };
  }, [ringOne, ringTwo, ringThree]);

  const surfaceFill = isDark ? "#0F162A" : "#F8FAFC";
  const lineColor = isDark ? "#64748B" : "#94A3B8";

  const baseRingStyle = {
    position: "absolute" as const,
    width: 150,
    height: 150,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: accentColor,
  };

  return (
    <View className="relative h-full w-full overflow-hidden rounded-xl">
      <Svg width="100%" height="100%" viewBox="0 0 340 170">
        <Defs>
          <Pattern
            id="radarGrid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={lineColor}
              strokeWidth="0.65"
            />
          </Pattern>
        </Defs>

        <Rect x="0" y="0" width="340" height="170" fill={surfaceFill} />
        <Rect
          x="0"
          y="0"
          width="340"
          height="170"
          fill="url(#radarGrid)"
          opacity="0.9"
        />

        <Path
          d="M0 128 C48 102 92 144 150 118 C212 90 266 130 340 104"
          fill="none"
          stroke={lineColor}
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <Path
          d="M0 96 C54 82 102 114 164 88 C228 62 278 95 340 76"
          fill="none"
          stroke={lineColor}
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <Path
          d="M0 62 C42 54 97 70 158 54 C220 38 280 52 340 44"
          fill="none"
          stroke={lineColor}
          strokeOpacity="0.35"
          strokeWidth="0.9"
        />

        <G x="170" y="86">
          <Circle cx="0" cy="0" r="7" fill={accentColor} />
          <Path
            d="M0 -15 C8 -15 14 -9 14 -1 C14 6 8 14 0 24 C-8 14 -14 6 -14 -1 C-14 -9 -8 -15 0 -15 Z"
            fill={accentColor}
            fillOpacity="0.9"
          />
          <Circle cx="0" cy="-2" r="4" fill={surfaceFill} />
        </G>
      </Svg>

      <View className="pointer-events-none absolute inset-0 items-center justify-center">
        <Animated.View
          style={[
            baseRingStyle,
            {
              opacity: ringOne.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [0.78, 0.12, 0],
              }),
              transform: [
                {
                  scale: ringOne.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.35, 1.45],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            baseRingStyle,
            {
              opacity: ringTwo.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [0.72, 0.1, 0],
              }),
              transform: [
                {
                  scale: ringTwo.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1.35],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            baseRingStyle,
            {
              opacity: ringThree.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [0.68, 0.1, 0],
              }),
              transform: [
                {
                  scale: ringThree.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.28, 1.25],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

export function SpotMapMarkerVisual({ accentColor, isDark }: VisualProps) {
  const bgFill = isDark ? "#0F172A" : "#EAF2FF";
  const tileStroke = isDark ? "#334155" : "#BFDBFE";
  const routeStroke = isDark ? "#64748B" : "#60A5FA";
  const lakeFill = isDark ? "#132F4C" : "#BFDBFE";
  const blockFill = isDark ? "#1E293B" : "#FFFFFF";

  return (
    <View className="h-full w-full overflow-hidden">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 170"
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect x="0" y="0" width="340" height="170" rx="16" fill={bgFill} />

        <Path
          d="M16 40 H324 M16 86 H324 M16 132 H324 M64 16 V154 M130 16 V154 M204 16 V154 M276 16 V154"
          stroke={tileStroke}
          strokeWidth="1"
          strokeOpacity="0.7"
        />

        <Path
          d="M-10 120 C30 98 74 106 112 84 C150 62 190 70 236 52 C280 36 314 44 350 30"
          fill="none"
          stroke={routeStroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
        <Path
          d="M-12 122 C28 100 72 108 112 86 C150 64 190 72 236 54 C280 38 314 46 352 32"
          fill="none"
          stroke={isDark ? "#93C5FD" : "#FFFFFF"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />

        <Path
          d="M246 110 C256 94 280 92 294 104 C306 116 304 136 286 144 C270 152 248 142 244 126 C242 120 242 116 246 110 Z"
          fill={lakeFill}
          fillOpacity="0.9"
        />

        <Rect
          x="30"
          y="30"
          width="44"
          height="24"
          rx="8"
          fill={blockFill}
          fillOpacity="0.8"
          stroke={tileStroke}
          strokeWidth="1"
        />
        <Rect
          x="142"
          y="108"
          width="54"
          height="28"
          rx="8"
          fill={blockFill}
          fillOpacity="0.8"
          stroke={tileStroke}
          strokeWidth="1"
        />

        <G x="170" y="82">
          <Path
            d="M0 -17 C9 -17 16 -10 16 -1 C16 8 8 17 0 29 C-8 17 -16 8 -16 -1 C-16 -10 -9 -17 0 -17 Z"
            fill={accentColor}
          />
          <Circle cx="0" cy="-2" r="5" fill={bgFill} />
          <Circle cx="0" cy="-2" r="2.4" fill={accentColor} fillOpacity="0.6" />
        </G>
      </Svg>
    </View>
  );
}

export function GearCombinationVisual({ accentColor, isDark }: VisualProps) {
  const panelFill = isDark ? "#0B1324" : "#EFF6FF";
  const slotFill = isDark ? "#182338" : "#FFFFFF";
  const slotStroke = isDark ? "#334155" : "#BFDBFE";
  const slotInner = isDark ? "#0F1B2E" : "#F8FBFF";
  const guideStroke = isDark ? "#64748B" : "#94A3B8";
  const iconFill = isDark ? "#E2E8F0" : "#334155";
  const plusColor = isDark ? "#93C5FD" : "#2563EB";

  return (
    <View className="h-full w-full overflow-hidden rounded-xl">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 170"
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect x="0" y="0" width="340" height="170" rx="16" fill={panelFill} />

        <Rect
          x="38"
          y="28"
          width="74"
          height="114"
          rx="12"
          fill={slotFill}
          stroke={slotStroke}
          strokeWidth="2"
        />
        <Rect
          x="133"
          y="28"
          width="74"
          height="114"
          rx="12"
          fill={slotFill}
          stroke={slotStroke}
          strokeWidth="2"
        />
        <Rect
          x="228"
          y="28"
          width="74"
          height="114"
          rx="12"
          fill={slotFill}
          stroke={slotStroke}
          strokeWidth="2"
        />

        <Rect x="44" y="34" width="62" height="102" rx="10" fill={slotInner} />
        <Rect x="139" y="34" width="62" height="102" rx="10" fill={slotInner} />
        <Rect x="234" y="34" width="62" height="102" rx="10" fill={slotInner} />

        <Line
          x1="118"
          y1="85"
          x2="128"
          y2="85"
          stroke={plusColor}
          strokeWidth="2.2"
        />
        <Line
          x1="123"
          y1="80"
          x2="123"
          y2="90"
          stroke={plusColor}
          strokeWidth="2.2"
        />
        <Line
          x1="213"
          y1="85"
          x2="223"
          y2="85"
          stroke={plusColor}
          strokeWidth="2.2"
        />
        <Line
          x1="218"
          y1="80"
          x2="218"
          y2="90"
          stroke={plusColor}
          strokeWidth="2.2"
        />

        <G x="75" y="85">
          <Line
            x1="-17"
            y1="24"
            x2="12"
            y2="-25"
            stroke={iconFill}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Line
            x1="-20"
            y1="29"
            x2="-14"
            y2="19"
            stroke={accentColor}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Path
            d="M12 -25 C16 -20 17 -10 15 2 C13 13 15 21 21 27"
            fill="none"
            stroke={guideStroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <Circle cx="12" cy="-25" r="2.2" fill={accentColor} />
          <Path
            d="M21 27 C20 31 23 34 27 33"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>

        <G x="170" y="85">
          <Path
            d="M-18 -4 C-11 -12 3 -12 13 -7 C20 -4 22 3 19 9 C16 17 6 23 -7 21 C-17 20 -24 13 -24 6 C-24 2 -22 -1 -18 -4 Z"
            fill={accentColor}
            fillOpacity="0.22"
            stroke={accentColor}
            strokeWidth="2"
          />
          <Path
            d="M-6 -8 C-1 -2 -1 11 -6 18"
            fill="none"
            stroke={guideStroke}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <Path
            d="M20 6 L26 8"
            fill="none"
            stroke={iconFill}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Line
            x1="-2"
            y1="20"
            x2="-2"
            y2="28"
            stroke={iconFill}
            strokeWidth="2"
          />
          <Path
            d="M-2 28 C-5 31 -6 34 -4 36"
            fill="none"
            stroke={iconFill}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Path
            d="M-2 28 C1 31 2 34 0 36"
            fill="none"
            stroke={iconFill}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>

        <G x="265" y="85">
          <Path
            d="M-16 -15 C-8 -23 8 -23 16 -15 C23 -7 22 5 16 13 C8 21 -8 21 -16 13 C-22 5 -23 -7 -16 -15 Z"
            fill="none"
            stroke={iconFill}
            strokeWidth="2"
          />
          <Circle
            cx="0"
            cy="-1"
            r="10"
            fill="none"
            stroke={accentColor}
            strokeWidth="2.2"
          />
          <Circle cx="0" cy="-1" r="3.2" fill={accentColor} />
          <Path
            d="M8 10 L20 22"
            fill="none"
            stroke={iconFill}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Circle cx="22" cy="24" r="3.5" fill={iconFill} />
        </G>

        <Rect
          x="60"
          y="34"
          width="30"
          height="8"
          rx="6"
          fill={guideStroke}
          fillOpacity="0.22"
        />
        <Rect
          x="155"
          y="34"
          width="30"
          height="8"
          rx="6"
          fill={guideStroke}
          fillOpacity="0.22"
        />
        <Rect
          x="250"
          y="34"
          width="30"
          height="8"
          rx="6"
          fill={guideStroke}
          fillOpacity="0.22"
        />
      </Svg>
    </View>
  );
}

export function TacticalBoardVisual({ accentColor, isDark }: VisualProps) {
  const boardFill = isDark ? "#0B1324" : "#F1F7FF";
  const gridColor = isDark ? "#334155" : "#BFDBFE";
  const thinLine = isDark ? "#94A3B8" : "#64748B";
  const knotColor = isDark ? "#CBD5E1" : "#334155";

  return (
    <View className="h-full w-full overflow-hidden rounded-xl">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 340 170"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <Pattern
            id="tacticalGrid"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M 22 0 L 0 0 0 22"
              fill="none"
              stroke={gridColor}
              strokeOpacity="0.35"
              strokeWidth="0.8"
            />
          </Pattern>
        </Defs>

        <Rect x="0" y="0" width="340" height="170" fill={boardFill} />
        <Rect x="0" y="0" width="340" height="170" fill="url(#tacticalGrid)" />

        <G x="110" y="85" transform="scale(1.5)">
          <Circle
            cx="0"
            cy="0"
            r="26"
            fill={isDark ? "#111827" : "#FFFFFF"}
            fillOpacity="0.92"
          />
          <Circle
            cx="0"
            cy="0"
            r="28"
            fill="none"
            stroke={thinLine}
            strokeWidth="2.2"
          />
          <Circle cx="0" cy="0" r="2.8" fill={accentColor} />
          <Line
            x1="0"
            y1="0"
            x2="0"
            y2="-14"
            stroke={accentColor}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <Line
            x1="0"
            y1="0"
            x2="10"
            y2="6"
            stroke={accentColor}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <Line
            x1="0"
            y1="-21"
            x2="0"
            y2="-28"
            stroke={thinLine}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Line
            x1="0"
            y1="21"
            x2="0"
            y2="28"
            stroke={thinLine}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Line
            x1="-21"
            y1="0"
            x2="-28"
            y2="0"
            stroke={thinLine}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Line
            x1="21"
            y1="0"
            x2="28"
            y2="0"
            stroke={thinLine}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>

        <G x="226" y="85" transform="rotate(-50) scale(2)">
          <Line
            x1="-20"
            y1="0"
            x2="20"
            y2="0"
            stroke={knotColor}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <Circle
            cx="-10"
            cy="-1"
            r="6.5"
            fill="none"
            stroke={knotColor}
            strokeWidth="3.5"
          />
          <Circle
            cx="10"
            cy="1"
            r="6.5"
            fill="none"
            stroke={knotColor}
            strokeWidth="3.5"
          />
          <Path
            d="M-5 -5 C-1 -1 1 1 5 5"
            fill="none"
            stroke={knotColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
}
