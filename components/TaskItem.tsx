import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Task } from '@/types/task';
import { colors } from '@/constants/colors';
import { Clock, CheckCircle2 } from 'lucide-react-native';
import ProgressBar from './ProgressBar';
import { calculateTaskProgress, formatTime } from '@/utils/helpers';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress: () => void;
}

export default function TaskItem({ task, onPress, onLongPress }: TaskItemProps) {
  const progress = calculateTaskProgress(task);
  
  // Get priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return colors.priorityHigh;
      case 'medium':
        return colors.priorityMedium;
      case 'low':
        return colors.priorityLow;
      case 'optional':
        return colors.priorityOptional;
      default:
        return colors.border;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.completedContainer,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityLine, { backgroundColor: getPriorityColor() }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            style={[
              styles.title,
              task.completed && styles.completedText
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          
          {task.completed && (
            <CheckCircle2 size={20} color={colors.success} />
          )}
        </View>

        {task.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{task.category}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={16} color={colors.textLight} />
            <Text style={styles.time}>
              {formatTime(task.estimatedMinutes)}
            </Text>
          </View>

          {task.subTasks.length > 0 && (
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} />
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  completedContainer: {
    opacity: 0.7,
  },
  priorityLine: {
    width: 4,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  categoryContainer: {
    backgroundColor: colors.categoryBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: colors.categoryText,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    marginLeft: 4,
    color: colors.textLight,
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  progressText: {
    marginLeft: 8,
    color: colors.textLight,
    fontSize: 12,
    minWidth: 35,
  },
});