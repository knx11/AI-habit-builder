import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle, Circle, Check, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Task } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { formatTime } from '@/utils/helpers';
import ProgressBar from './ProgressBar';
import { Swipeable } from 'react-native-gesture-handler';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function TaskItem({ task, onPress, onLongPress }: TaskItemProps) {
  const { completeTask, deleteTask } = useTaskStore();
  const swipeableRef = useRef<Swipeable>(null);

  const handleToggleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    completeTask(task.id, !task.completed);
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    deleteTask(task.id);
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

  // Render the left action (Complete)
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 0],
      extrapolate: 'clamp',
    });
    
    const opacity = progress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.leftAction, 
          { 
            transform: [{ translateX: trans }],
            opacity
          }
        ]}
      >
        <Check size={24} color="#fff" />
        <Text style={styles.actionText}>Complete</Text>
      </Animated.View>
    );
  };

  // Render the right action (Delete)
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-101, -100, -50, 0],
      outputRange: [0, 0, 0, 20],
      extrapolate: 'clamp',
    });
    
    const opacity = progress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.rightAction, 
          { 
            transform: [{ translateX: trans }],
            opacity
          }
        ]}
      >
        <Text style={styles.actionText}>Delete</Text>
        <Trash2 size={24} color="#fff" />
      </Animated.View>
    );
  };

  // Handle swipe actions
  const onSwipeableOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      // Delete action
      handleDelete();
    } else {
      // Complete action
      completeTask(task.id, true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    
    // Close the swipeable after action
    setTimeout(() => {
      swipeableRef.current?.close();
    }, 300);
  };

  // Render different content for web vs native
  const renderContent = () => {
    return (
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
    );
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
      
      {Platform.OS !== 'web' ? (
        <Swipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          onSwipeableOpen={onSwipeableOpen}
          leftThreshold={80}
          rightThreshold={80}
          friction={2}
          overshootFriction={8}
        >
          {renderContent()}
        </Swipeable>
      ) : (
        // Fallback for web (no swipe gestures)
        renderContent()
      )}
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
  // Swipeable action styles
  leftAction: {
    flex: 1,
    backgroundColor: '#34C759', // iOS green
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  rightAction: {
    flex: 1,
    backgroundColor: '#FF3B30', // iOS red
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});