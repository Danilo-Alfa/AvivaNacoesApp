import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>
      )}
      <TextInput
        className={`bg-background border border-border rounded-lg px-4 py-3 text-base text-foreground ${error ? 'border-destructive' : ''} ${className || ''}`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error && (
        <Text className="text-destructive text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
