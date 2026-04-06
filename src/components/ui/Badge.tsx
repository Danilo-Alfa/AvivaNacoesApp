import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  icon?: React.ReactNode;
}

export function Badge({ label, variant = 'default', icon, className, ...props }: BadgeProps) {
  const variantClass = {
    default: 'bg-primary',
    destructive: 'bg-destructive',
    outline: 'bg-transparent border border-border',
    secondary: 'bg-muted',
  }[variant];

  const textClass = {
    default: 'text-white',
    destructive: 'text-white',
    outline: 'text-foreground',
    secondary: 'text-foreground',
  }[variant];

  return (
    <View className={`flex-row items-center rounded-full px-3 py-1 ${variantClass} ${className || ''}`} {...props}>
      {icon}
      <Text className={`text-xs font-medium ${textClass} ${icon ? 'ml-1' : ''}`}>{label}</Text>
    </View>
  );
}
