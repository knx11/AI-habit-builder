// Update handlers
const handleToggleComplete = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  completeTask(task.id, !task.completed);
};

const handleToggleSubTaskComplete = (subTaskId: string, completed: boolean) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  completeSubTask(task.id, subTaskId, !completed);
};

const handleDeleteTask = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
  deleteTask(task.id);
  onClose();
};

const handleDeleteSubTask = (subTaskId: string) => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  deleteSubTask(task.id, subTaskId);
};

const handleEditTitle = () => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
  setNewTitle(task.title);
  setEditingTitle(true);
};

const saveTitle = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  if (newTitle.trim()) {
    updateTask(task.id, { title: newTitle });
  }
  setEditingTitle(false);
};