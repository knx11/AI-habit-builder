import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
}

export default function ProgressBar({
  progress,
  height = 4,
  backgroundColor = colors.border,
  progressColor = colors.primary,
}: ProgressBarProps) {
  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View
        style={[
          styles.progress,
          {
            width: `${progress}%`,
            backgroundColor: progressColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});