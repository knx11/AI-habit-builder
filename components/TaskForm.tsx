import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal as RNModal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { generateTaskBreakdown } from '@/services/aiService';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categories = ['Work', 'Personal', 'Study', 'Health', 'Home'];

export default function TaskForm({ visible, onClose, onSuccess }: TaskFormProps) {
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [category, setCategory] = useState<string>('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEstimatedMinutes(30);
    setCategory('');
    setError('');
  };

  const handleCategorySelect = (cat: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setCategory(cat);
  };

  const handleSubmit = async () => {
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
      title: title.trim(),
      description: description.trim(),
      estimatedMinutes,
      category: category || 'Other',
    });

    if (description) {
      setIsGenerating(true);
      try {
        const breakdown = await generateTaskBreakdown(title, description);
        if (breakdown.subTasks.length > 0) {
          useTaskStore.getState().addAIGeneratedSubTasks(taskId, breakdown.subTasks);
        }
      } catch (error) {
        console.error('Failed to generate subtasks:', error);
      } finally {
        setIsGenerating(false);
      }
    }

    resetForm();
    if (onSuccess) onSuccess();
    onClose();
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
            <Text style={styles.title}>New Task</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter task description"
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Estimated Time (minutes)</Text>
              <TextInput
                style={styles.input}
                value={String(estimatedMinutes)}
                onChangeText={(value) => setEstimatedMinutes(parseInt(value) || 30)}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.selectedCategory,
                    ]}
                    onPress={() => handleCategorySelect(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat && styles.selectedCategoryText,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isGenerating && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isGenerating}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>
                  {isGenerating ? 'Creating...' : 'Create Task'}
                </Text>
              </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.background,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});