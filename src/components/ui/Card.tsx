import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-card rounded-xl border border-border overflow-hidden ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <View className={`p-4 ${className || ''}`} {...props}>
      {children}
    </View>
  );
}
