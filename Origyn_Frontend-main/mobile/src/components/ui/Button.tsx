import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  color?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  color = 'green',
  isLoading = false,
  disabled = false,
  className,
  textClassName,
}: ButtonProps) => {
  const getVariantStyles = () => {
    if (disabled) return 'bg-navy-800 opacity-50';
    
    const colorStyles = {
      green: 'bg-green-accent text-navy-900',
      amber: 'bg-consumer text-navy-900',
      red: 'bg-red-500 text-white',
      blue: 'bg-distributor text-navy-900',
      purple: 'bg-retailer text-white',
    };

    const outlineStyles = {
      green: 'border-2 border-green-accent text-green-accent bg-transparent',
      amber: 'border-2 border-consumer text-consumer bg-transparent',
      red: 'border-2 border-red-500 text-red-500 bg-transparent',
      blue: 'border-2 border-distributor text-distributor bg-transparent',
      purple: 'border-2 border-retailer text-retailer bg-transparent',
    };

    switch (variant) {
      case 'outline':
        return outlineStyles[color];
      case 'ghost':
        return `bg-transparent text-${color === 'green' ? 'green-accent' : color === 'amber' ? 'consumer' : color === 'blue' ? 'distributor' : color === 'purple' ? 'retailer' : 'red-500'}`;
      case 'primary':
      default:
        return colorStyles[color];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={twMerge(
        'w-full py-4 rounded-xl items-center justify-center flex-row',
        getVariantStyles(),
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#00FF88' : '#0A0F1E'} />
      ) : (
        <Text
          className={twMerge(
            'text-lg font-bold',
            variant === 'primary' ? 'text-navy-900' : '',
            variant === 'outline' || variant === 'ghost' ? '' : '',
            textClassName
          )}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
