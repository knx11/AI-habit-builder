import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle, Circle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Task } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { formatTime } from '@/utils/helpers';
import ProgressBar from './ProgressBar';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function TaskItem({ task, onPress, onLongPress }: TaskItemProps) {
  const { completeTask } = useTaskStore();

  const handleToggleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    completeTask(task.id, !task.completed);
  };

  // Get priority color
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return '#3498db'; // Blue
      case 'medium':
        return '#f1c40f'; // Yellow
      case 'low':
        return '#2ecc71'; // Green
      case 'optional':
        return '#bdc3c7'; // Light Gray
      default:
        return colors.border; // Default
    }
  };

  return (
    <View style={styles.itemContainer}>
      {/* Priority indicator */}
      <View 
        style={[
          styles.priorityIndicator, 
          { backgroundColor: getPriorityColor() }
        ]} 
      />
      
      <View style={styles.container}>
        {/* Main task content */}
        <TouchableOpacity 
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          style={styles.taskContent}
        >
          <View style={styles.taskHeader}>
            <View style={styles.titleContainer}>
              <TouchableOpacity onPress={handleToggleComplete}>
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
            <Text style={styles.time}>{formatTime(task.estimatedMinutes)}</Text>
          </View>

          {task.subTasks.length > 0 && (
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={task.subTasks.filter(st => st.completed).length / task.subTasks.length * 100}
                height={3}
                backgroundColor={colors.border}
                progressColor={task.completed ? colors.primary : colors.secondary}
              />
              <Text style={styles.subtaskCount}>
                {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length} subtasks
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    zIndex: 1,
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  taskContent: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  time: {
    fontSize: 14,
    color: colors.textLight,
  },
  progressContainer: {
    marginTop: 12,
  },
  subtaskCount: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
});