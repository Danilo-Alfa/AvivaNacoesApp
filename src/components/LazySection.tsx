import React, { useState, useCallback, ReactNode } from 'react';
import { View, LayoutChangeEvent } from 'react-native';

interface LazySectionProps {
  children: ReactNode;
  scrollY: number;
  viewportHeight: number;
  threshold?: number;
  placeholder?: ReactNode;
  estimatedHeight?: number;
}

export const LazySection = React.memo(function LazySection({
  children,
  scrollY,
  viewportHeight,
  threshold = 400,
  placeholder,
  estimatedHeight = 300,
}: LazySectionProps) {
  const [sectionY, setSectionY] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setSectionY(e.nativeEvent.layout.y);
  }, []);

  const shouldMount =
    mounted ||
    (sectionY !== null && scrollY + viewportHeight + threshold > sectionY);

  if (shouldMount && !mounted) {
    setMounted(true);
  }

  return (
    <View onLayout={onLayout}>
      {mounted ? children : placeholder ?? <View style={{ height: estimatedHeight }} />}
    </View>
  );
});
