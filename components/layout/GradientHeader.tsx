import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface GradientHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  /** Extra content rendered below the title row (e.g. a control on the hero). */
  children?: ReactNode;
  /** Extra classes for the gradient container (spacing tweaks per screen). */
  className?: string;
}

// Diagonal indigo → purple hero. Slightly deeper stops in dark mode so the
// gradient still reads as elevated against a near-black background.
const LIGHT_STOPS = ['#4f46e5', '#9333ea'] as const; // indigo-600 → purple-600
const DARK_STOPS = ['#4338ca', '#7e22ce'] as const; // indigo-700 → purple-700

/**
 * Rounded-bottom gradient "hero" header. Drop-in replacement for the plain
 * white title bars on top-level screens. Purely presentational — mirrors the
 * `Header` prop shape so callers swap without behavior changes.
 */
export function GradientHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftContent,
  rightContent,
  children,
  className = '',
}: GradientHeaderProps) {
  const router = useRouter();
  const { scheme } = useThemeColors();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <LinearGradient
      colors={scheme === 'dark' ? DARK_STOPS : LIGHT_STOPS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
    >
      <View className={`px-4 pt-4 pb-5 ${className}`}>
        {(title || leftContent || rightContent || showBack) && (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {showBack && (
                <TouchableOpacity
                  onPress={handleBack}
                  className="mr-2 -ml-2 p-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ChevronLeft size={26} color="#ffffff" />
                </TouchableOpacity>
              )}
              {leftContent}
              {title && !leftContent && (
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white" numberOfLines={1}>
                    {title}
                  </Text>
                  {subtitle && (
                    <Text className="text-sm text-white/80 mt-0.5" numberOfLines={1}>
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}
            </View>
            {rightContent && (
              <View className="flex-row items-center">{rightContent}</View>
            )}
          </View>
        )}
        {children}
      </View>
    </LinearGradient>
  );
}
