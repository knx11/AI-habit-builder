import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Task } from '@/types/task';
import { colors } from '@/constants/colors';
import { formatTime } from '@/utils/helpers';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress: () => void;
}

export default function TaskItem({ task, onPress, onLongPress }: TaskItemProps) {
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

  const getCategoryColor = () => {
    switch (task.category?.toLowerCase()) {
      case 'work':
        return colors.categoryWork;
      case 'health':
        return colors.categoryHealth;
      case 'personal':
        return colors.categoryPersonal;
      default:
        return colors.secondary;
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityBar, { backgroundColor: getPriorityColor() }]} />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        
        {task.category && (
          <View style={[styles.categoryChip, { backgroundColor: getCategoryColor() }]}>
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
        )}
        
        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        
        <Text style={styles.time}>
          {formatTime(task.estimatedMinutes)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoryText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    color: colors.textLight,
  },
});