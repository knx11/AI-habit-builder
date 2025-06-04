import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Pressable,
  Animated,
  PanResponder,
  Alert,
  Platform
} from 'react-native';
import { 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  MoreVertical,
  Trash2,
  Edit2,
  Zap
} from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types/task';
import { colors } from '@/constants/colors';
import { formatTime, calculateTaskProgress } from '@/utils/helpers';
import ProgressBar from '@/components/ProgressBar';
import * as Haptics from 'expo-haptics';
import { generateTaskBreakdown } from '@/services/aiService';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onEdit?: () => void;
  onLongPress?: () => void;
}

export default function TaskItem({ task, onPress, onEdit, onLongPress }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { completeTask, completeSubTask, deleteTask, deleteSubTask, addAIGeneratedSubTasks } = useTaskStore();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const progress = calculateTaskProgress(task);
  const hasSubTasks = task.subTasks.length > 0;
  
  // Animation values
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Create pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        // Provide haptic feedback when gesture starts
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // Limit the swipe distance
        const newValue = Math.max(-100, Math.min(100, gestureState.dx));
        swipeAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          // Swipe right to complete/uncomplete
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 5
          }).start(() => {
            toggleTaskCompletion();
          });
        } else if (gestureState.dx < -50) {
          // Swipe left to show delete/edit options
          Animated.spring(swipeAnim, {
            toValue: -80,
            useNativeDriver: true,
            tension: 40,
            friction: 5
          }).start();
        } else {
          // Reset position
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 5
          }).start();
        }
      }
    })
  ).current;
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const toggleTaskCompletion = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate completion
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    completeTask(task.id, !task.completed);
  };
  
  const toggleSubTaskCompletion = (subTaskId: string, completed: boolean, e: any) => {
    e.stopPropagation();
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    completeSubTask(task.id, subTaskId, !completed);
  };
  
  const handleDeleteTask = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    // Animate deletion
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      deleteTask(task.id);
    });
  };
  
  const handleDeleteSubTask = (subTaskId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    deleteSubTask(task.id, subTaskId);
  };
  
  const handleEditTask = () => {
    if (onEdit) {
      onEdit();
    } else {
      onPress();
    }
    
    // Reset swipe position
    Animated.spring(swipeAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 5
    }).start();
  };
  
  const handleLongPress = async (subTaskId?: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    if (subTaskId) {
      // Handle long press on subtask
      const subTask = task.subTasks.find(st => st.id === subTaskId);
      if (!subTask) return;
      
      Alert.alert(
        "Break Down Subtask",
        `Do you want to break down "${subTask.title}" into smaller tasks?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Break Down", 
            onPress: async () => {
              setIsGeneratingAI(true);
              try {
                const result = await generateTaskBreakdown(subTask.title, "");
                addAIGeneratedSubTasks(task.id, result.subTasks);
              } catch (error) {
                console.error('Error breaking down subtask:', error);
              } finally {
                setIsGeneratingAI(false);
              }
            }
          }
        ]
      );
    } else {
      // Handle long press on main task
      if (onLongPress) {
        onLongPress();
      } else {
        Alert.alert(
          "Break Down Task",
          `Do you want to break down "${task.title}" into smaller tasks?`,
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Break Down", 
              onPress: async () => {
                setIsGeneratingAI(true);
                try {
                  const result = await generateTaskBreakdown(task.title, task.description);
                  addAIGeneratedSubTasks(task.id, result.subTasks);
                } catch (error) {
                  console.error('Error breaking down task:', error);
                } finally {
                  setIsGeneratingAI(false);
                }
              }
            }
          ]
        );
      }
    }
  };
  
  // Reset swipe position when component unmounts
  const resetSwipe = () => {
    Animated.spring(swipeAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 5
    }).start();
  };
  
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
    >
      {/* Action buttons that appear on swipe left */}
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
      <Animated.View 
        style={styles.taskContent}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.taskHeader} 
          onPress={onPress}
          onLongPress={() => handleLongPress()}
          activeOpacity={0.7}
          delayLongPress={500}
        >
          <Pressable onPress={toggleTaskCompletion} hitSlop={10}>
            {task.completed ? (
              <CheckCircle size={24} color={colors.primary} />
            ) : (
              <Circle size={24} color={colors.primary} />
            )}
          </Pressable>
          
          <View style={styles.taskContentMiddle}>
            <Text 
              style={[
                styles.taskTitle, 
                task.completed && styles.completedText
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            
            {hasSubTasks && (
              <View style={styles.progressContainer}>
                <ProgressBar progress={progress} />
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            )}
          </View>
          
          <View style={styles.taskActions}>
            <View style={styles.timeContainer}>
              <Clock size={14} color={colors.textLight} />
              <Text style={styles.timeText}>{formatTime(task.estimatedMinutes)}</Text>
            </View>
            
            {hasSubTasks && (
              <TouchableOpacity onPress={toggleExpanded} hitSlop={10}>
                {expanded ? (
                  <ChevronUp size={20} color={colors.textLight} />
                ) : (
                  <ChevronDown size={20} color={colors.textLight} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
        
        {expanded && hasSubTasks && (
          <View style={styles.subTasksContainer}>
            {task.subTasks.map((subTask) => (
              <Animated.View key={subTask.id} style={styles.subTaskItemWrapper}>
                <TouchableOpacity 
                  style={styles.subTaskItem}
                  onLongPress={() => handleLongPress(subTask.id)}
                  delayLongPress={500}
                >
                  <Pressable 
                    onPress={(e) => toggleSubTaskCompletion(subTask.id, subTask.completed, e)}
                    hitSlop={10}
                  >
                    {subTask.completed ? (
                      <CheckCircle size={18} color={colors.primary} />
                    ) : (
                      <Circle size={18} color={colors.primary} />
                    )}
                  </Pressable>
                  
                  <Text 
                    style={[
                      styles.subTaskTitle, 
                      subTask.completed && styles.completedText
                    ]}
                    numberOfLines={1}
                  >
                    {subTask.title}
                  </Text>
                  
                  <Text style={styles.subTaskTime}>
                    {formatTime(subTask.estimatedMinutes)}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => handleDeleteSubTask(subTask.id)}
                    hitSlop={10}
                  >
                    <Trash2 size={16} color={colors.textLight} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
        
        {isGeneratingAI && (
          <View style={styles.aiGeneratingContainer}>
            <Zap size={16} color={colors.primary} />
            <Text style={styles.aiGeneratingText}>Generating subtasks...</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    flexDirection: 'row',
    position: 'relative',
  },
  actionButtons: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 100,
    zIndex: -1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    zIndex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskContentMiddle: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 8,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  subTasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  subTaskItemWrapper: {
    overflow: 'hidden',
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subTaskTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    marginRight: 8,
  },
  subTaskTime: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 12,
  },
  aiGeneratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(45, 74, 67, 0.1)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  aiGeneratingText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontStyle: 'italic',
  },
});