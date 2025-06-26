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
        return '#f1c40f'; // Yellow/orange for high priority
      case 'medium':
        return '#f1c40f';
      case 'low':
        return '#bdc3c7'; // Gray for low priority
      case 'optional':
        return '#bdc3c7';
      default:
        return '#bdc3c7';
    }
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
            <View style={styles.categoryContainer}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
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
    flexDirection: 'row',
    marginBottom: 16,
  },
  priorityIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  swipeableContainer: {
    flex: 1,
  },
  swipeableChildrenContainer: {
    backgroundColor: colors.background,
    borderRadius: 0,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 0,
    overflow: 'hidden',
  },
  taskContent: {
    paddingVertical: 16,
    paddingRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#8BBAB4', // Muted green color from the design
    paddingHorizontal: 12,
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
    lineHeight: 20,
  },
  timeText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
});