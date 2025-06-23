import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  Dimensions
} from 'react-native';
import { Task } from '@/types/task';
import { colors } from '@/constants/colors';
import { formatTime } from '@/utils/helpers';
import { Circle, CheckCircle, Clock } from 'lucide-react-native';
import ProgressBar from './ProgressBar';
import { Swipeable } from 'react-native-gesture-handler';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onLongPress: () => void;
}

export default function TaskItem({ task, onPress, onLongPress }: TaskItemProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return '#3498db';
      case 'medium':
        return '#f1c40f';
      case 'low':
        return '#2ecc71';
      case 'optional':
        return '#bdc3c7';
      default:
        return colors.border;
    }
  };

  const progress = task.subTasks.length > 0
    ? (task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100
    : task.completed ? 100 : 0;

  const onSwipeableOpen = () => {
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        swipeableRef.current?.close();
        setIsSwiping(false);
      }, 2000);
    }
  };

  const renderLeftActions = () => {
    return (
      <View style={styles.leftAction}>
        <CheckCircle size={24} color={colors.success} />
      </View>
    );
  };

  const renderRightActions = () => {
    return (
      <View style={styles.rightAction}>
        <Clock size={24} color={colors.primary} />
      </View>
    );
  };

  // Render the main task content
  const renderTaskContent = () => {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          onPress={isSwiping ? undefined : onPress}
          onLongPress={isSwiping ? undefined : onLongPress}
          activeOpacity={0.7}
          style={styles.taskContent}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text 
                style={[
                  styles.title,
                  task.completed && styles.completedText
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.category && (
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
              )}
            </View>
          </View>

          {task.description ? (
            <Text 
              style={styles.description}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <View style={styles.progressContainer}>
              <ProgressBar 
                progress={progress}
                height={3}
                backgroundColor={colors.border}
                progressColor={getPriorityColor()}
              />
              <Text style={styles.progressText}>
                {task.subTasks.length > 0 
                  ? `${task.subTasks.filter(st => st.completed).length}/${task.subTasks.length} subtasks`
                  : formatTime(task.estimatedMinutes)
                }
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // On web, don't use Swipeable
  if (Platform.OS === 'web') {
    return (
      <View style={styles.itemContainer}>
        <View 
          style={[
            styles.priorityIndicator, 
            { backgroundColor: getPriorityColor() }
          ]} 
        />
        <View style={styles.swipeableContainer}>
          {renderTaskContent()}
        </View>
      </View>
    );
  }

  // On native, use Swipeable
  return (
    <View style={styles.itemContainer}>
      <View 
        style={[
          styles.priorityIndicator, 
          { backgroundColor: getPriorityColor() }
        ]} 
      />
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableOpen={onSwipeableOpen}
        onSwipeableWillOpen={() => setIsSwiping(true)}
        onSwipeableWillClose={() => setIsSwiping(false)}
        leftThreshold={80}
        rightThreshold={80}
        friction={2}
        overshootFriction={8}
        containerStyle={styles.swipeableContainer}
        childrenContainerStyle={styles.swipeableChildrenContainer}
      >
        {renderTaskContent()}
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  priorityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  swipeableContainer: {
    flex: 1,
  },
  swipeableChildrenContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  categoryChip: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  leftAction: {
    flex: 1,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightAction: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});