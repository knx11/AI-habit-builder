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
        return '#FFB800';    // Yellow
      case 'medium':
        return '#8BBAB4';    // Teal
      case 'low':
        return '#CCCCCC';    // Gray
      case 'optional':
        return '#CCCCCC';    // Gray
      default:
        return colors.border;
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
          <View style={styles.categoryChip}>
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
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 8,
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 4,
    backgroundColor: colors.secondary + '20', // 20% opacity
  },
  categoryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: colors.textLight,
  },
});