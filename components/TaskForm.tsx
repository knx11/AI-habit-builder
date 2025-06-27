import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { X, Clock, Calendar, Zap, AlertCircle, List } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import { useTaskStore } from '@/store/taskStore';
import { formatTime, estimateTaskTime } from '@/utils/helpers';
import { generateTaskBreakdown } from '@/services/aiService';
import { TaskPriority } from '@/types/task';
import { format } from 'date-fns';
import TaskItem from '@/components/TaskItem';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: Date;
}

type FormMode = 'new' | 'existing';

export default function TaskForm({ visible, onClose, onSuccess, initialDate }: TaskFormProps) {
  const [mode, setMode] = useState<FormMode>('new');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDate);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState('');
  
  const { tasks, addTask, addAIGeneratedSubTasks, updateTask } = useTaskStore();
  
  // Filter only tasks without due dates
  const availableTasks = tasks.filter(task => !task.dueDate && !task.completed);
  
  const categories = [
    'Work', 'Personal', 'Study', 'Health', 'Home', 'Other'
  ];
  
  const priorities: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'high', label: 'High', color: '#3498db' },
    { value: 'medium', label: 'Medium', color: '#f1c40f' },
    { value: 'low', label: 'Low', color: '#2ecc71' },
    { value: 'optional', label: 'Optional', color: '#bdc3c7' },
  ];
  
  const resetForm = () => {
    setMode('new');
    setTitle('');
    setDescription('');
    setEstimatedMinutes(30);
    setCategory('');
    setPriority('medium');
    setDueDate(undefined);
    setError('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    const taskId = addTask({
      title,
      description,
      estimatedMinutes,
      category: category || 'Other',
      priority,
      dueDate: dueDate?.toISOString(),
    });
    
    resetForm();
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleSelectExistingTask = (taskId: string) => {
    if (dueDate) {
      updateTask(taskId, { dueDate: dueDate.toISOString() });
      if (onSuccess) onSuccess();
      onClose();
    }
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {mode === 'new' ? 'New Task' : 'Select Task'}
      </Text>
      <TouchableOpacity onPress={handleClose} hitSlop={10}>
        <X size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      <TouchableOpacity 
        style={[styles.modeButton, mode === 'new' && styles.selectedMode]}
        onPress={() => setMode('new')}
      >
        <Calendar size={20} color={mode === 'new' ? colors.background : colors.text} />
        <Text style={[styles.modeText, mode === 'new' && styles.selectedModeText]}>
          New Task
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.modeButton, mode === 'existing' && styles.selectedMode]}
        onPress={() => setMode('existing')}
      >
        <List size={20} color={mode === 'existing' ? colors.background : colors.text} />
        <Text style={[styles.modeText, mode === 'existing' && styles.selectedModeText]}>
          Existing Tasks
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {renderHeader()}
          {renderModeSelector()}
          
          {mode === 'new' ? (
            <ScrollView style={styles.form}>
              <View style={styles.formField}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Task title"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Task description"
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryButtons}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        category === cat && styles.selectedCategory,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          category === cat && styles.selectedCategoryText,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityButtons}>
                  {priorities.map((p) => (
                    <TouchableOpacity
                      key={p.value}
                      style={[
                        styles.priorityButton,
                        { borderColor: p.color },
                        priority === p.value && { backgroundColor: p.color },
                      ]}
                      onPress={() => setPriority(p.value)}
                    >
                      <Text
                        style={[
                          styles.priorityButtonText,
                          { color: p.color },
                          priority === p.value && { color: '#fff' },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Estimated Time (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={estimatedMinutes.toString()}
                  onChangeText={(text) => setEstimatedMinutes(parseInt(text) || 0)}
                  keyboardType="number-pad"
                  placeholder="30"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </ScrollView>
          ) : (
            <FlatList
              data={availableTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => handleSelectExistingTask(item.id)}
                  style={styles.taskItem}
                >
                  <TaskItem
                    task={item}
                    onPress={() => handleSelectExistingTask(item.id)}
                    onLongPress={() => {}}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No tasks available</Text>
                  <Text style={styles.emptySubtext}>
                    All tasks already have due dates or are completed
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.taskList}
            />
          )}
          
          {mode === 'new' && (
            <View style={styles.footer}>
              <Button
                title="Create Task"
                onPress={handleSubmit}
                style={styles.submitButton}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  selectedMode: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  selectedModeText: {
    color: colors.background,
  },
  form: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.categoryBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.categoryText,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: colors.background,
  },
  priorityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityButtonText: {
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    marginLeft: 8,
  },
  taskList: {
    padding: 20,
  },
  taskItem: {
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    width: '100%',
  },
});