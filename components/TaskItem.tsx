import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { Task } from '@/types/task';
import { colors } from '@/constants/colors';
import { formatTime } from '@/utils/helpers';
import { Circle, CheckCircle } from 'lucide-react-native';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress: () => void;
}

export default function TaskItem({ task, onPress, onLongPress }: TaskItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityLine, { backgroundColor: getPriorityColor(task.priority) }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={onPress}>
              {task.completed ? (
                <CheckCircle size={24} color={colors.primary} />
              ) : (
                <Circle size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
            <Text 
              style={[
                styles.title,
                task.completed && styles.completedText
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
          </View>
          {task.category && (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          )}
        </View>
        
        {task.description ? (
          <Text 
            style={styles.description}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}
        
        <Text style={styles.timeText}>
          {formatTime(task.estimatedMinutes)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'high':
      return colors.priorityHigh;
    case 'medium':
      return colors.priorityMedium;
    case 'low':
      return colors.priorityLow;
    default:
      return colors.priorityOptional;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  priorityLine: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  categoryChip: {
    backgroundColor: colors.categoryBackground,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: colors.categoryText,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
});