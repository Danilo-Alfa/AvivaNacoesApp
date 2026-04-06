import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ title, variant = 'primary', loading, icon, disabled, style, ...props }: ButtonProps) {
  const { isDark } = useTheme();

  const colors = {
    primary: isDark ? '#60a5fa' : '#1e3a5f',
    foreground: isDark ? '#f1f5f9' : '#1e293b',
    muted: isDark ? '#1e293b' : '#f1f3f5',
    border: isDark ? '#334155' : '#e2e8f0',
  };

  const bgMap = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.muted },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColorMap = {
    primary: '#ffffff',
    secondary: colors.foreground,
    outline: colors.primary,
    ghost: colors.primary,
  };

  const spinnerColor = variant === 'primary' ? '#ffffff' : colors.primary;

  return (
    <TouchableOpacity
      style={[
        s.base,
        bgMap[variant],
        disabled ? { opacity: 0.5 } : undefined,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {icon}
          <Text style={[s.text, { color: textColorMap[variant] }, icon ? { marginLeft: 8 } : undefined]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});
