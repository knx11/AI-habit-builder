import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  X, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Edit2,
  Share2, 
  Zap,
  Trash
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Task } from '@/types/task';
import { useTaskStore } from '@/store/taskStore';
import { formatTime, formatDate } from '@/utils/helpers';
import Button from '@/components/Button';
import PomodoroTimer from '@/components/PomodoroTimer';
import * as Haptics from 'expo-haptics';
import { generateTaskBreakdown } from '@/services/aiService';

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
    updateTask,
    updateSubTask,
    deleteSubTask,
    addSubTask,
    addAIGeneratedSubTasks,
    deleteAllSubTasks
  } = useTaskStore();
  
  const [showTimer, setShowTimer] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [newSubTaskTime, setNewSubTaskTime] = useState('');
  const [addingSubTask, setAddingSubTask] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const task = tasks.find((t) => t.id === taskId);
  
  if (!task) {
    return null;
  }
  
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
  
  const handleDeleteAllSubTasks = () => {
    Alert.alert(
      'Delete All Subtasks',
      'Are you sure you want to delete all subtasks for this task? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            deleteAllSubTasks(task.id);
          },
        },
      ]
    );
  };
  
  const handleEditTitle = () => {
    setNewTitle(task.title);
    setEditingTitle(true);
  };
  
  const saveTitle = () => {
    if (newTitle.trim()) {
      updateTask(task.id, { title: newTitle });
    }
    setEditingTitle(false);
  };
  
  const handleEditSubTask = (subTaskId: string, title: string, estimatedMinutes: number) => {
    setEditingSubTaskId(subTaskId);
    setNewSubTaskTitle(title);
    setNewSubTaskTime(estimatedMinutes.toString());
  };
  
  const saveSubTask = () => {
    if (editingSubTaskId && newSubTaskTitle.trim()) {
      updateSubTask(task.id, editingSubTaskId, { 
        title: newSubTaskTitle,
        estimatedMinutes: parseInt(newSubTaskTime) || 15
      });
    }
    setEditingSubTaskId(null);
  };
  
  const handleAddSubTask = () => {
    setAddingSubTask(true);
    setNewSubTaskTitle('');
    setNewSubTaskTime('15');
  };
  
  const saveNewSubTask = () => {
    if (newSubTaskTitle.trim()) {
      addSubTask(task.id, {
        title: newSubTaskTitle,
        estimatedMinutes: parseInt(newSubTaskTime) || 15
      });
    }
    setAddingSubTask(false);
  };
  
  const handleGenerateAISubtasks = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsGeneratingAI(true);
    setAiError(null);
    
    try {
      const result = await generateTaskBreakdown(task.title, task.description);
      
      // Update the main task's estimated time
      updateTask(task.id, { 
        estimatedMinutes: result.totalEstimatedMinutes,
        aiGenerated: true
      });
      
      // Add the generated subtasks
      addAIGeneratedSubTasks(task.id, result.subTasks);
      
    } catch (error) {
      console.error('Error generating AI subtasks:', error);
      setAiError("Failed to generate subtasks. Please try again.");
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  const exportToCalendar = () => {
    // This would integrate with the device calendar
    // For now, we'll just show a message
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    alert('Task exported to calendar');
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={exportToCalendar}
              >
                <Share2 size={20} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.headerButton, styles.deleteButton]}
                onPress={handleDeleteTask}
              >
                <Trash2 size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.body}>
            <View style={styles.titleSection}>
              {editingTitle ? (
                <View style={styles.editTitleContainer}>
                  <TextInput
                    style={styles.editTitleInput}
                    value={newTitle}
                    onChangeText={setNewTitle}
                    autoFocus
                  />
                  <TouchableOpacity onPress={saveTitle}>
                    <Text style={styles.saveButton}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.titleContainer}>
                  <TouchableOpacity onPress={handleToggleComplete}>
                    {task.completed ? (
                      <CheckCircle size={24} color={colors.primary} />
                    ) : (
                      <Circle size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <Text style={[styles.title, task.completed && styles.completedText]}>
                    {task.title}
                  </Text>
                  
                  <TouchableOpacity onPress={handleEditTitle}>
                    <Edit2 size={18} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              )}
              
              {task.category && (
                <View style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Clock size={16} color={colors.textLight} />
                <Text style={styles.infoText}>
                  Estimated: {formatTime(task.estimatedMinutes)}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Calendar size={16} color={colors.textLight} />
                <Text style={styles.infoText}>
                  Created: {formatDate(task.createdAt)}
                </Text>
              </View>
            </View>
            
            {task.description ? (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{task.description}</Text>
              </View>
            ) : null}
            
            {showTimer ? (
              <View style={styles.timerSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Pomodoro Timer</Text>
                  <TouchableOpacity onPress={() => setShowTimer(false)}>
                    <Text style={styles.hideText}>Hide</Text>
                  </TouchableOpacity>
                </View>
                <PomodoroTimer taskId={task.id} />
              </View>
            ) : (
              <Button
                title="Start Pomodoro Timer"
                onPress={() => setShowTimer(true)}
                style={styles.timerButton}
              />
            )}
            
            <View style={styles.subTasksSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Subtasks</Text>
                <View style={styles.subTaskActions}>
                  {task.subTasks.length > 0 ? (
                    <TouchableOpacity 
                      onPress={handleDeleteAllSubTasks}
                      style={styles.deleteAllButton}
                    >
                      <Trash size={16} color={colors.danger} />
                      <Text style={styles.deleteAllText}>Delete All</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      onPress={handleGenerateAISubtasks}
                      disabled={isGeneratingAI}
                      style={[styles.aiButton, isGeneratingAI && styles.disabledButton]}
                    >
                      {isGeneratingAI ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <>
                          <Zap size={16} color={colors.primary} />
                          <Text style={styles.aiButtonText}>AI Generate</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={handleAddSubTask}>
                    <Text style={styles.addText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {aiError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{aiError}</Text>
                </View>
              )}
              
              {task.subTasks.length === 0 ? (
                <Text style={styles.emptyText}>No subtasks yet</Text>
              ) : (
                <>
                  {task.subTasks.map((subTask) => (
                    <View key={subTask.id} style={styles.subTaskItem}>
                      {editingSubTaskId === subTask.id ? (
                        <View style={styles.editSubTaskContainer}>
                          <TextInput
                            style={styles.editSubTaskInput}
                            value={newSubTaskTitle}
                            onChangeText={setNewSubTaskTitle}
                            autoFocus
                          />
                          <View style={styles.editSubTaskTime}>
                            <TextInput
                              style={styles.editSubTaskTimeInput}
                              value={newSubTaskTime}
                              onChangeText={setNewSubTaskTime}
                              keyboardType="number-pad"
                            />
                            <Text style={styles.minutesText}>min</Text>
                          </View>
                          <TouchableOpacity onPress={saveSubTask}>
                            <Text style={styles.saveButton}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <>
                          <TouchableOpacity 
                            onPress={() => handleToggleSubTaskComplete(subTask.id, subTask.completed)}
                            hitSlop={10}
                          >
                            {subTask.completed ? (
                              <CheckCircle size={20} color={colors.primary} />
                            ) : (
                              <Circle size={20} color={colors.primary} />
                            )}
                          </TouchableOpacity>
                          
                          <View style={styles.subTaskContent}>
                            <Text 
                              style={[
                                styles.subTaskTitle, 
                                subTask.completed && styles.completedText
                              ]}
                            >
                              {subTask.title}
                            </Text>
                            <Text style={styles.subTaskTime}>
                              {formatTime(subTask.estimatedMinutes)}
                            </Text>
                          </View>
                          
                          <View style={styles.subTaskActions}>
                            <TouchableOpacity 
                              onPress={() => handleEditSubTask(
                                subTask.id, 
                                subTask.title, 
                                subTask.estimatedMinutes
                              )}
                              hitSlop={10}
                              style={styles.actionButton}
                            >
                              <Edit2 size={16} color={colors.textLight} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              onPress={() => handleDeleteSubTask(subTask.id)}
                              hitSlop={10}
                              style={styles.actionButton}
                            >
                              <Trash2 size={16} color={colors.danger} />
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  ))}
                  
                  {/* Add a dedicated Delete All button at the bottom for better visibility */}
                  <TouchableOpacity 
                    style={styles.deleteAllSubtasksButton}
                    onPress={handleDeleteAllSubTasks}
                  >
                    <Trash2 size={18} color={colors.danger} />
                    <Text style={styles.deleteAllSubtasksText}>Delete All Subtasks</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {addingSubTask && (
                <View style={styles.addSubTaskContainer}>
                  <TextInput
                    style={styles.editSubTaskInput}
                    value={newSubTaskTitle}
                    onChangeText={setNewSubTaskTitle}
                    placeholder="Subtask title"
                    placeholderTextColor={colors.textLight}
                    autoFocus
                  />
                  <View style={styles.editSubTaskTime}>
                    <TextInput
                      style={styles.editSubTaskTimeInput}
                      value={newSubTaskTime}
                      onChangeText={setNewSubTaskTime}
                      keyboardType="number-pad"
                      placeholder="15"
                      placeholderTextColor={colors.textLight}
                    />
                    <Text style={styles.minutesText}>min</Text>
                  </View>
                  <View style={styles.addSubTaskActions}>
                    <TouchableOpacity onPress={() => setAddingSubTask(false)}>
                      <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveNewSubTask}>
                      <Text style={styles.saveButton}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  deleteButton: {
    marginLeft: 16,
  },
  body: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginHorizontal: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  editTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editTitleInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    marginRight: 12,
    paddingVertical: 4,
  },
  categoryChip: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: colors.background,
    fontWeight: '500',
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    color: colors.textLight,
    marginLeft: 6,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    color: colors.text,
    lineHeight: 22,
  },
  timerSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hideText: {
    color: colors.textLight,
  },
  timerButton: {
    marginBottom: 20,
  },
  subTasksSection: {
    marginBottom: 20,
  },
  subTaskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 12,
  },
  aiButtonText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.danger,
    marginRight: 12,
  },
  deleteAllText: {
    color: colors.danger,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addText: {
    color: colors.primary,
    fontWeight: '500',
  },
  emptyText: {
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subTaskContent: {
    flex: 1,
    marginLeft: 12,
  },
  subTaskTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  subTaskTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionButton: {
    marginLeft: 16,
  },
  editSubTaskContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editSubTaskInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    marginRight: 8,
    paddingVertical: 4,
  },
  editSubTaskTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  editSubTaskTimeInput: {
    width: 40,
    fontSize: 16,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    textAlign: 'center',
    paddingVertical: 4,
  },
  minutesText: {
    color: colors.textLight,
    marginLeft: 4,
  },
  saveButton: {
    color: colors.primary,
    fontWeight: '500',
  },
  addSubTaskContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
  },
  addSubTaskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    color: colors.textLight,
    marginRight: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
  },
  deleteAllSubtasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  deleteAllSubtasksText: {
    color: colors.danger,
    fontWeight: '500',
    marginLeft: 8,
  },
});