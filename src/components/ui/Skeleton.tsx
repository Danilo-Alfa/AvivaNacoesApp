import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export function Skeleton({ width, height, borderRadius = 8, style, ...props }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const { isDark } = useTheme();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: isDark ? '#334155' : '#e2e8f0',
          opacity,
        },
        style,
      ]}
      {...props}
    />
  );
}
