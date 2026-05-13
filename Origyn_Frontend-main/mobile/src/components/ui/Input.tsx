import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  containerClassName?: string;
}

export const Input = ({ label, error, isPassword, containerClassName, ...props }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={twMerge('w-full mb-4', containerClassName)}>
      <Text className="text-gray-400 text-sm mb-2">{label}</Text>
      <View 
        className={twMerge(
          'w-full bg-navy-800 rounded-xl border flex-row items-center px-4',
          isFocused ? 'border-green-accent' : 'border-gray-700',
          error ? 'border-red-500' : ''
        )}
      >
        <TextInput
          className="flex-1 py-4 text-white font-medium"
          placeholderTextColor="#6B7280"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
            {showPassword ? <EyeOff color="#6B7280" size={20} /> : <Eye color="#6B7280" size={20} />}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
};
