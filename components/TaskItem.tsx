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
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;
  
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
        
        // Scale up slightly on touch
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 40,
          friction: 7
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate swipe percentage
        const swipePercentage = (gestureState.dx / 300) * 100;
        
        // Animate background color based on swipe direction
        if (gestureState.dx > 0) {
          // Right swipe - complete action
          backgroundColorAnim.setValue(Math.min(Math.abs(swipePercentage) / 40, 1));
          checkmarkOpacity.setValue(Math.min(Math.abs(swipePercentage) / 40, 1));
        } else {
          // Left swipe - delete action
          backgroundColorAnim.setValue(0);
          checkmarkOpacity.setValue(0);
        }
        
        // Limit the swipe distance with resistance
        const newValue = gestureState.dx > 0 
          ? Math.min(100, gestureState.dx * 0.7) 
          : Math.max(-100, gestureState.dx * 0.7);
        
        swipeAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Reset scale
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 40,
          friction: 7
        }).start();
        
        if (gestureState.dx > 100) {
          // Swipe right to complete/uncomplete
          Animated.parallel([
            Animated.spring(swipeAnim, {
              toValue: 0,
              useNativeDriver: true,
              tension: 40,
              friction: 5
            }),
            Animated.timing(backgroundColorAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false
            }),
            Animated.timing(checkmarkOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            })
          ]).start(() => {
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
          // Reset position with spring animation
          Animated.parallel([
            Animated.spring(swipeAnim, {
              toValue: 0,
              useNativeDriver: true,
              tension: 40,
              friction: 5
            }),
            Animated.timing(backgroundColorAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false
            }),
            Animated.timing(checkmarkOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            })
          ]).start();
        }
      }
    })
  ).current;
  
  // ... rest of the component code remains the same ...

  // Interpolate background color for swipe animation
  const animatedBackgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.cardBackground, '#E8F5E9'] // Soft green background
  });
  
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
      {/* Checkmark indicator that fades in on right swipe */}
      <Animated.View 
        style={[
          styles.checkmarkIndicator,
          { opacity: checkmarkOpacity }
        ]}
      >
        <CheckCircle size={24} color="#2ECC71" />
      </Animated.View>
      
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
        style={[
          styles.taskContent,
          { backgroundColor: animatedBackgroundColor }
        ]}
        {...panResponder.panHandlers}
      >
        {/* ... rest of the JSX remains the same ... */}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ... existing styles remain the same ...
  
  checkmarkIndicator: {
    position: 'absolute',
    left: -40,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
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
    transform: [{ scale: 0.9 }], // Slightly smaller by default
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
    
    // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  // ... rest of the styles remain the same ...
});