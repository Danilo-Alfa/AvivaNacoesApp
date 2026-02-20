import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ title, variant = 'primary', loading, icon, disabled, className, ...props }: ButtonProps) {
  const { isDark } = useTheme();
  const spinnerColor = variant === 'primary' ? '#ffffff' : (isDark ? '#60a5fa' : '#1e3a5f');
  const baseClass = 'flex-row items-center justify-center rounded-lg px-6 py-3 min-h-[48px]';
  const variantClass = {
    primary: 'bg-primary',
    secondary: 'bg-muted',
    outline: 'border-2 border-primary bg-transparent',
    ghost: 'bg-transparent',
  }[variant];

  const textClass = {
    primary: 'text-white font-semibold text-base',
    secondary: 'text-foreground font-semibold text-base',
    outline: 'text-primary font-semibold text-base',
    ghost: 'text-primary font-semibold text-base',
  }[variant];

  return (
    <TouchableOpacity
      className={`${baseClass} ${variantClass} ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {icon}
          <Text className={`${textClass} ${icon ? 'ml-2' : ''}`}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
