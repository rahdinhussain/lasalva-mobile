import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<LogoSize, number> = {
  sm: 32,
  md: 48,
  lg: 80,
  xl: 120,
};

interface LogoProps {
  /** Size variant. Default: lg */
  size?: LogoSize;
  /** Custom size in pixels (overrides size variant) */
  width?: number;
  /** Custom height in pixels (defaults to width for square) */
  height?: number;
  /** Optional custom image source (defaults to app icon) */
  source?: ImageSourcePropType;
  className?: string;
}

const defaultSource = require('../../assets/icon.png');

/**
 * Lasalva logo used on login, auth screens, and loading.
 * Uses the app icon (assets/icon.png) by default; replace that file with your logo.
 */
export function Logo({
  size = 'lg',
  width,
  height,
  source = defaultSource,
  className = '',
}: LogoProps) {
  const w = width ?? SIZE_MAP[size];
  const h = height ?? w;

  return (
    <View className={className} style={{ width: w, height: h }}>
      <Image
        source={source}
        style={{ width: w, height: h, borderRadius: size === 'lg' || size === 'xl' ? 20 : 12 }}
        resizeMode="contain"
        accessibilityLabel="Lasalva logo"
      />
    </View>
  );
}
