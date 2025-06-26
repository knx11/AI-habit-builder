import React, { useRef, useState } from 'react';
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
        return '#f1c40f'; // Yellow for high priority
      case 'medium':
        return '#f1c40f'; // Yellow for medium priority
      case 'low':
        return '#bdc3c7'; // Gray for low priority
      case 'optional':
        return '#bdc3c7'; // Gray for optional
      default:
        return '#bdc3c7';
    }
  };

  // Render the main task content
  const renderTaskContent = () => {
    return (
      <View style={styles.container}>
        <View 
          style={[
            styles.priorityIndicator, 
            { backgroundColor: getPriorityColor() }
          ]} 
        />
        <TouchableOpacity 
          onPress={isSwiping ? undefined : onPress}
          onLongPress={isSwiping ? undefined : onLongPress}
          activeOpacity={0.7}
          style={styles.taskContent}
        >
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
        </TouchableOpacity>
      </View>
    );
  };

  // On web, don't use Swipeable
  if (Platform.OS === 'web') {
    return (
      <View style={styles.itemContainer}>
        {renderTaskContent()}
      </View>
    );
  }

  // On native, use Swipeable
  return (
    <View style={styles.itemContainer}>
      <Swipeable
        ref={swipeableRef}
        onSwipeableWillOpen={() => setIsSwiping(true)}
        onSwipeableWillClose={() => setIsSwiping(false)}
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
    marginBottom: 16,
  },
  swipeableContainer: {
    flex: 1,
  },
  swipeableChildrenContainer: {
    backgroundColor: colors.background,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  priorityIndicator: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
    lineHeight: 20,
  },
  timeText: {
    fontSize: 14,
    color: colors.textLight,
  },
});