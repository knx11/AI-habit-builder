import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Modal as RNModal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle, Circle, Trash2, Edit2, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { formatTime, formatDate } from '@/utils/helpers';
import ProgressBar from './ProgressBar';

interface TaskDetailsProps {
  visible: boolean;
  taskId: string | null;
  onClose: () => void;
}

export default function TaskDetails({ visible, taskId, onClose }: TaskDetailsProps) {
  const {
    tasks,
    completeTask,
    completeSubTask,
    deleteTask,
    deleteSubTask,
    updateTask,
    addSubTask,
  } = useTaskStore();
  
  const task = tasks.find((t) => t.id === taskId);
  
  const [newTitle, setNewTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskTime, setNewSubTaskTime] = useState('30');
  const [addingSubTask, setAddingSubTask] = useState(false);
  
  if (!task) return null;
  
  const progress = task.subTasks.length > 0
    ? (task.subTasks.filter((st) => st.completed).length / task.subTasks.length) * 100
    : task.completed ? 100 : 0;
  
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
  
  const handleAddSubTask = () => {
    if (!newSubTaskTitle.trim()) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    addSubTask(task.id, {
      title: newSubTaskTitle.trim(),
      estimatedMinutes: parseInt(newSubTaskTime) || 30,
    });
    
    setNewSubTaskTitle('');
    setNewSubTaskTime('30');
    setAddingSubTask(false);
  };
  
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={0.7} />
        <View style={styles.content}>
          <ScrollView style={styles.container}>
            <View style={styles.header}>
              {editingTitle ? (
                <View style={styles.editTitleContainer}>
                  <TextInput
                    style={styles.editTitleInput}
                    value={newTitle}
                    onChangeText={setNewTitle}
                    autoFocus
                  />
                  <TouchableOpacity onPress={saveTitle} activeOpacity={0.7}>
                    <Text style={styles.saveButton}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.titleContainer}>
                  <TouchableOpacity onPress={handleToggleComplete} activeOpacity={0.7}>
                    {task.completed ? (
                      <CheckCircle size={24} color={colors.primary} />
                    ) : (
                      <Circle size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.title,
                      task.completed && styles.completedText,
                    ]}
                  >
                    {task.title}
                  </Text>
                </View>
              )}
              
              <View style={styles.actions}>
                {!editingTitle && (
                  <TouchableOpacity 
                    onPress={handleDeleteTask}
                    style={styles.actionButton}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={20} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>
                {formatDate(task.createdAt)}
              </Text>
            </View>
            
            {task.category && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoLabel}>Category</Text>
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
              </View>
            )}
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Estimated Time</Text>
              <Text style={styles.infoValue}>
                {formatTime(task.estimatedMinutes)}
              </Text>
            </View>
            
            {task.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.description}>{task.description}</Text>
              </View>
            )}
            
            <View style={styles.subtasksContainer}>
              <View style={styles.subtasksHeader}>
                <Text style={styles.subtasksTitle}>Subtasks</Text>
                <TouchableOpacity 
                  onPress={() => setAddingSubTask(true)}
                  activeOpacity={0.7}
                >
                  <Plus size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              {task.subTasks.length > 0 && (
                <View style={styles.progressContainer}>
                  <ProgressBar progress={progress} />
                  <Text style={styles.progressText}>
                    {task.subTasks.filter((st) => st.completed).length} of{' '}
                    {task.subTasks.length} completed
                  </Text>
                </View>
              )}
              
              {addingSubTask && (
                <View style={styles.addSubTaskContainer}>
                  <TextInput
                    style={styles.addSubTaskInput}
                    value={newSubTaskTitle}
                    onChangeText={setNewSubTaskTitle}
                    placeholder="Subtask title"
                    placeholderTextColor={colors.textLight}
                    autoFocus
                  />
                  <View style={styles.addSubTaskRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={newSubTaskTime}
                      onChangeText={setNewSubTaskTime}
                      keyboardType="number-pad"
                      placeholder="30"
                      placeholderTextColor={colors.textLight}
                    />
                    <Text style={styles.timeLabel}>min</Text>
                    <View style={styles.addSubTaskActions}>
                      <TouchableOpacity 
                        onPress={() => setAddingSubTask(false)}
                        style={styles.cancelButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={handleAddSubTask}
                        style={styles.addButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              
              {task.subTasks.length === 0 && !addingSubTask ? (
                <Text style={styles.noSubtasks}>
                  No subtasks yet. Tap + to add one.
                </Text>
              ) : (
                <View style={styles.subtasksList}>
                  {task.subTasks.map((subTask) => (
                    <View key={subTask.id} style={styles.subtaskItem}>
                      <TouchableOpacity 
                        onPress={() => handleToggleSubTaskComplete(subTask.id, subTask.completed)}
                        activeOpacity={0.7}
                      >
                        {subTask.completed ? (
                          <CheckCircle size={20} color={colors.primary} />
                        ) : (
                          <Circle size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                      <Text
                        style={[
                          styles.subtaskTitle,
                          subTask.completed && styles.completedText,
                        ]}
                      >
                        {subTask.title}
                      </Text>
                      <Text style={styles.subtaskTime}>
                        {formatTime(subTask.estimatedMinutes)}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => handleDeleteSubTask(subTask.id)}
                        style={styles.deleteSubtask}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color={colors.textLight} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    flex: 1,
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  editTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editTitleInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 4,
  },
  saveButton: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  categoryChip: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  categoryText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  subtasksContainer: {
    marginTop: 16,
  },
  subtasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
  noSubtasks: {
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  subtasksList: {
    marginTop: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  subtaskTime: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 8,
  },
  deleteSubtask: {
    padding: 4,
  },
  addSubTaskContainer: {
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addSubTaskInput: {
    fontSize: 14,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    marginBottom: 8,
  },
  addSubTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 50,
    fontSize: 14,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
  },
  addSubTaskActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: colors.textLight,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
});