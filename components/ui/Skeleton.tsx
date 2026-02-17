import React, { useRef, useEffect } from 'react';
import { View, ViewProps, Animated } from 'react-native';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
          borderRadius,
          opacity,
        },
        style,
      ]}
      className={`bg-slate-200 ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <View className={`gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 && lines > 1 ? '70%' : '100%'}
        />
      ))}
    </View>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <View className={`bg-white rounded-2xl border border-slate-200 p-4 ${className}`}>
      <View className="flex-row items-center gap-3 mb-4">
        <SkeletonAvatar size={48} />
        <View className="flex-1 gap-2">
          <Skeleton height={18} width="60%" />
          <Skeleton height={14} width="40%" />
        </View>
      </View>
      <SkeletonText lines={2} />
    </View>
  );
}

export function SkeletonListItem({ className = '' }: { className?: string }) {
  return (
    <View className={`flex-row items-center py-3 gap-3 ${className}`}>
      <SkeletonAvatar size={40} />
      <View className="flex-1 gap-2">
        <Skeleton height={16} width="70%" />
        <Skeleton height={14} width="40%" />
      </View>
    </View>
  );
}
