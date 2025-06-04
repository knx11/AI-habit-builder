// Update button handlers
const handleClose = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  resetForm();
  onClose();
};

const handleSubmit = () => {
  if (!title.trim()) {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setError('Task title is required');
    return;
  }

  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  
  const taskId = addTask({
    title,
    description,
    estimatedMinutes,
    category: category || 'Other',
  });
  
  resetForm();
  if (onSuccess) onSuccess();
  onClose();
};

const handleCategorySelect = (cat: string) => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
  setCategory(cat);
};

// Update in the render
<TouchableOpacity
  key={cat}
  style={[
    styles.categoryChip,
    category === cat && styles.selectedCategory,
  ]}
  onPress={() => handleCategorySelect(cat)}
>
  {/* Category chip content */}
</TouchableOpacity>