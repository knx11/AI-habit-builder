import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function AnalyticsCard({
  title,
  value,
  subtitle,
  icon,
  color = colors.primary,
  isLoading = false,
  fullWidth = false,
}: AnalyticsCardProps) {
  if (isLoading) {
    return (
      <View style={[styles.container, { borderLeftColor: color }, fullWidth && styles.fullWidth]}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingBar, { backgroundColor: color }]} />
            <Text style={styles.loadingText}>Analyzing...</Text>
          </View>
        </View>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderLeftColor: color }, fullWidth && styles.fullWidth]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }, fullWidth && styles.fullWidthValue]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textLight,
  },
  iconContainer: {
    marginLeft: 12,
  },
  fullWidth: {
    marginBottom: 16,
  },
  fullWidthValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  loadingBar: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginRight: 8,
    opacity: 0.6,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});