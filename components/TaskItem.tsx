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

  // Render the main task content
  const renderTaskContent = () => {
    return (
      <TouchableOpacity 
        onPress={isSwiping ? undefined : onPress}
        onLongPress={isSwiping ? undefined : onLongPress}
        activeOpacity={0.7}
        style={styles.container}
      >
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
      </TouchableOpacity>
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
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
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