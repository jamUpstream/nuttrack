import React from 'react';
import Svg, { Path, G, Line, ClipPath, Defs, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  size?: number;
  /** Override colors; defaults to the active accent. */
  cap?: string;
  body?: string;
}

/**
 * The NutTrack acorn, redrawn as vector so it tints with the chosen accent
 * and stays crisp at any size. Cap uses `primary`, body uses `primaryContainer`
 * — the same two-tone relationship as the original logo.
 */
export default function AcornMark({ size = 40, cap, body }: Props) {
  const { colors } = useTheme();
  const capColor = cap ?? colors.primary;
  const bodyColor = body ?? colors.primaryContainer;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id="capClip">
          <Path d="M17 44 C17 22 31 13 50 13 C69 13 83 22 83 44 Z" />
        </ClipPath>
      </Defs>

      {/* stem */}
      <Path
        d="M50 16 C50 9 47 5 43 3"
        stroke={capColor}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />

      {/* leaf */}
      <Path
        d="M53 13 C59 3 71 0 78 3 C76 12 65 19 53 13 Z"
        fill={bodyColor}
      />

      {/* nut body */}
      <Path
        d="M20 43 H80 C80 69 68 86 52 94 C50.7 94.7 49.3 94.7 48 94 C32 86 20 69 20 43 Z"
        fill={bodyColor}
      />

      {/* body highlight, mirrors the swoosh in the original */}
      <Path
        d="M31 52 C31 67 35 78 41 85"
        stroke="#ffffff"
        strokeOpacity={0.55}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />

      {/* cap */}
      <G>
        <Path d="M17 44 C17 22 31 13 50 13 C69 13 83 22 83 44 Z" fill={capColor} />
        <G clipPath="url(#capClip)" opacity={0.35}>
          {[-40, -20, 0, 20, 40, 60, 80].map((x) => (
            <Line key={`a${x}`} x1={x} y1={0} x2={x + 60} y2={60} stroke="#ffffff" strokeWidth={3} />
          ))}
          {[20, 40, 60, 80, 100, 120, 140].map((x) => (
            <Line key={`b${x}`} x1={x} y1={0} x2={x - 60} y2={60} stroke="#ffffff" strokeWidth={3} />
          ))}
        </G>
        <Rect x={17} y={40} width={66} height={7} rx={3.5} fill={capColor} />
      </G>
    </Svg>
  );
}
