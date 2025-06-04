import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps,
  Platform,
  View
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  ...rest
}: ButtonProps) {
  const getButtonStyle = () => {
    let buttonStyle = {};
    
    // Variant styles
    if (variant === 'primary') {
      buttonStyle = styles.primaryButton;
    } else if (variant === 'secondary') {
      buttonStyle = styles.secondaryButton;
    } else if (variant === 'outline') {
      buttonStyle = styles.outlineButton;
    }
    
    // Size styles
    if (size === 'small') {
      buttonStyle = { ...buttonStyle, ...styles.smallButton };
    } else if (size === 'large') {
      buttonStyle = { ...buttonStyle, ...styles.largeButton };
    }
    
    // Disabled style
    if (disabled || loading) {
      buttonStyle = { ...buttonStyle, ...styles.disabledButton };
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyle = styles.buttonText;
    
    if (variant === 'primary') {
      textStyle = { ...textStyle, ...styles.primaryButtonText };
    } else if (variant === 'secondary') {
      textStyle = { ...textStyle, ...styles.secondaryButtonText };
    } else if (variant === 'outline') {
      textStyle = { ...textStyle, ...styles.outlineButtonText };
    }
    
    if (size === 'small') {
      textStyle = { ...textStyle, ...styles.smallButtonText };
    } else if (size === 'large') {
      textStyle = { ...textStyle, ...styles.largeButtonText };
    }
    
    if (disabled || loading) {
      textStyle = { ...textStyle, ...styles.disabledButtonText };
    }
    
    return textStyle;
  };
  
  // Update onPress handler
  const handlePress = () => {
    if (Platform.OS !== 'web' && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.background : colors.primary} 
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: colors.background,
  },
  secondaryButtonText: {
    color: colors.background,
  },
  outlineButtonText: {
    color: colors.primary,
  },
  smallButtonText: {
    fontSize: 14,
  },
  largeButtonText: {
    fontSize: 18,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});