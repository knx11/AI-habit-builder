import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeIn,
  FadeOut,
  Layout
} from 'react-native-reanimated';
import { Task } from '@/types/task';
import { colors } from '@/constants/colors';
import { formatTime } from '@/utils/helpers';
import { Swipeable } from 'react-native-gesture-handler';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function TaskItem({ task, onPress, onLongPress }: TaskItemProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  useEffect(() => {
    if (task.completed) {
      opacity.value = withTiming(0.6, { duration: 300 });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [task.completed]);

  const getPriorityColor = () => {
    switch (task.priority) {
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

  // Render the main task content
  const renderTaskContent = () => {
    return (
      <AnimatedTouchableOpacity 
        onPress={isSwiping ? undefined : onPress}
        onLongPress={isSwiping ? undefined : onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        style={[styles.container, animatedStyle]}
      >
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
        <View style={styles.taskContent}>
          <View style={styles.headerRow}>
            <Text 
              style={[
                styles.title,
                task.completed && styles.completedText
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>

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
      </AnimatedTouchableOpacity>
    );
  };

  // On web, don't use Swipeable
  if (Platform.OS === 'web') {
    return (
      <Animated.View 
        style={styles.itemContainer}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
      >
        {renderTaskContent()}
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={styles.itemContainer}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      <Swipeable
        ref={swipeableRef}
        onSwipeableWillOpen={() => setIsSwiping(true)}
        onSwipeableWillClose={() => setIsSwiping(false)}
        containerStyle={styles.swipeableContainer}
        childrenContainerStyle={styles.swipeableChildrenContainer}
      >
        {renderTaskContent()}
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 16,
  },
  swipeableContainer: {
    flex: 1,
  },
  swipeableChildrenContainer: {
    backgroundColor: colors.background,
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
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
  priorityIndicator: {
    height: 4,
    width: '100%',
  },
  taskContent: {
    padding: 20,
    backgroundColor: colors.cardBackground,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  categoryChip: {
    backgroundColor: colors.categoryBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: colors.categoryText,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
});