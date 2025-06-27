import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Modal, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  FlatList
} from 'react-native';
import { X, Zap, AlertTriangle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from './Button';
import { useTaskStore } from '@/store/taskStore';
import { generateTaskBreakdown } from '@/services/aiService';
import * as Haptics from 'expo-haptics';
import { Task, TaskPriority } from '@/types/task';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
}

const CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Home', 'Other'];
const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: '#3498db' },
  { value: 'medium', label: 'Medium', color: '#f1c40f' },
  { value: 'low', label: 'Low', color: '#2ecc71' },
  { value: 'optional', label: 'Optional', color: '#bdc3c7' }
];

export default function TaskForm({ visible, onClose, initialDate }: TaskFormProps) {
  const { addTask, tasks } = useTaskStore();
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const taskId = addTask({
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || undefined,
      estimatedMinutes: parseInt(estimatedMinutes) || 30,
      dueDate: initialDate?.toISOString(),
      priority
    });

    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available');
      }
    }

    resetForm();
    onClose();
  };

  const handleGenerateAI = async () => {
    if (!title.trim()) {
      setAiError('Please enter a task title first');
      return;
    }

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const result = await generateTaskBreakdown(title, description);
      setEstimatedMinutes(result.totalEstimatedMinutes.toString());
      if (result.suggestedPriority) {
        setPriority(result.suggestedPriority);
      }
      
      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.log('Haptics not available');
        }
      }
    } catch (error) {
      console.error('Error generating AI breakdown:', error);
      setAiError('Failed to generate time estimate. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('medium');
    setEstimatedMinutes('30');
    setAiError(null);
    setMode('new');
  };

  const handleSelectTask = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setCategory(task.category || '');
    setPriority(task.priority || 'medium');
    setEstimatedMinutes(task.estimatedMinutes.toString());
    setMode('new');
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
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.modeButtons}>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'new' && styles.activeModeButton]}
                onPress={() => setMode('new')}
              >
                <Text style={[styles.modeButtonText, mode === 'new' && styles.activeModeButtonText]}>
                  New Task
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeButton, mode === 'existing' && styles.activeModeButton]}
                onPress={() => setMode('existing')}
              >
                <Text style={[styles.modeButtonText, mode === 'existing' && styles.activeModeButtonText]}>
                  Existing Tasks
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'new' ? (
            <ScrollView style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter task title"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter task description"
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryChips}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        category === cat && styles.selectedCategoryChip
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        category === cat && styles.selectedCategoryChipText
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityButtons}>
                  {PRIORITIES.map((p) => (
                    <TouchableOpacity
                      key={p.value}
                      style={[
                        styles.priorityButton,
                        { borderColor: p.color },
                        priority === p.value && { backgroundColor: p.color }
                      ]}
                      onPress={() => setPriority(p.value)}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        { color: p.color },
                        priority === p.value && { color: '#fff' }
                      ]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Estimated Time (minutes)</Text>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    value={estimatedMinutes}
                    onChangeText={setEstimatedMinutes}
                    keyboardType="number-pad"
                    placeholder="30"
                    placeholderTextColor={colors.textLight}
                  />
                  <TouchableOpacity 
                    style={[styles.aiButton, isGeneratingAI && styles.disabledButton]}
                    onPress={handleGenerateAI}
                    disabled={isGeneratingAI}
                  >
                    {isGeneratingAI ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Zap size={20} color={colors.primary} />
                        <Text style={styles.aiButtonText}>AI Estimate</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                {aiError && (
                  <View style={styles.errorContainer}>
                    <AlertTriangle size={16} color={colors.danger} />
                    <Text style={styles.errorText}>{aiError}</Text>
                  </View>
                )}
              </View>

              <Button
                title="Create Task"
                onPress={handleSubmit}
                style={styles.submitButton}
              />
            </ScrollView>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.existingTaskItem}
                  onPress={() => handleSelectTask(item)}
                >
                  <Text style={styles.existingTaskTitle}>{item.title}</Text>
                  {item.category && (
                    <Text style={styles.existingTaskCategory}>{item.category}</Text>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.existingTasksList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '90%'
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center'
  },
  modeButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginLeft: 48 // To offset the close button and center the mode buttons
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeModeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  modeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500'
  },
  activeModeButtonText: {
    color: colors.background
  },
  form: {
    padding: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16
  },
  textArea: {
    height: 100,
    paddingTop: 12
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.categoryBackground,
    borderWidth: 1,
    borderColor: colors.border
  },
  selectedCategoryChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryChipText: {
    color: colors.categoryText,
    fontSize: 14,
    fontWeight: '500'
  },
  selectedCategoryChipText: {
    color: colors.background
  },
  priorityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  priorityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  timeInput: {
    flex: 1
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 8
  },
  aiButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500'
  },
  disabledButton: {
    opacity: 0.6
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginTop: 8
  },
  errorText: {
    color: colors.danger,
    marginLeft: 8
  },
  submitButton: {
    marginTop: 8
  },
  existingTasksList: {
    padding: 20
  },
  existingTaskItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  existingTaskTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4
  },
  existingTaskCategory: {
    fontSize: 14,
    color: colors.textLight
  }
});