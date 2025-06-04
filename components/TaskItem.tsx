import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle, Circle, Edit2, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Task } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { formatTime } from '@/utils/helpers';
import ProgressBar from './ProgressBar';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onEdit?: () => void;
  onLongPress?: () => void;
}

export default function TaskItem({ task, onPress, onEdit, onLongPress }: TaskItemProps) {
  const { completeTask, deleteTask } = useTaskStore();
  
  // Animation values
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Limit the swipe range
        const x = Math.min(Math.max(gestureState.dx, -100), 100);
        swipeAnim.setValue(x);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          // Left swipe - show actions
          Animated.spring(swipeAnim, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else if (gestureState.dx > 50) {
          // Right swipe - complete
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start(() => handleToggleComplete());
        } else {
          // Reset position
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleToggleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    completeTask(task.id, !task.completed);
  };

  const handleEditTask = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onEdit) {
      onEdit();
    }
    // Reset swipe position
    Animated.spring(swipeAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleDeleteTask = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Reset swipe position
            Animated.spring(swipeAnim, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTask(task.id);
            // Animate out before deletion
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      ]
    );
  };

  // Animation for task completion
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: task.completed ? 0.95 : 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [task.completed]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { translateX: swipeAnim },
            { scale: scaleAnim }
          ],
          opacity: opacityAnim
        }
      ]}
      {...panResponder.panHandlers}
    >
      {/* Action buttons for left swipe */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEditTask}
        >
          <Edit2 size={20} color={colors.background} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteTask}
        >
          <Trash2 size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  actionButtons: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 1,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: colors.secondary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
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