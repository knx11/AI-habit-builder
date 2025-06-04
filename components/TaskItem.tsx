// Previous imports remain the same...

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onEdit?: () => void;
  onLongPress?: () => void;
}

export default function TaskItem({ task, onPress, onEdit, onLongPress }: TaskItemProps) {
  // Previous state declarations remain the same...

  const toggleTaskCompletion = () => {
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
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTask(task.id);
          }
        }
      ]
    );
  };

  // Rest of the component code remains the same...

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
      {/* Rest of the JSX remains the same... */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    position: 'relative',
  },
  // Rest of the styles remain the same...
});