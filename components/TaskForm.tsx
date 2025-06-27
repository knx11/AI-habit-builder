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
  Platform
} from 'react-native';
import { X, Zap, AlertTriangle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from './Button';
import { useTaskStore } from '@/store/taskStore';
import { generateTaskBreakdown } from '@/services/aiService';
import * as Haptics from 'expo-haptics';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export default function TaskForm({ visible, onClose, initialDate }: TaskFormProps) {
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
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
    setEstimatedMinutes('30');
    setAiError(null);
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
            <Text style={styles.headerTitle}>New Task</Text>
            <View style={styles.headerRight} />
          </View>

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
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Enter category (optional)"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Time (minutes)</Text>
              <TextInput
                style={styles.input}
                value={estimatedMinutes}
                onChangeText={setEstimatedMinutes}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={styles.aiSection}>
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
                    <Text style={styles.aiButtonText}>AI Time Estimate</Text>
                  </>
                )}
              </TouchableOpacity>

              {aiError && (
                <View style={styles.errorContainer}>
                  <AlertTriangle size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{aiError}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title="Create Task"
              onPress={handleSubmit}
              style={styles.footerButton}
            />
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text
  },
  headerRight: {
    width: 24
  },
  form: {
    padding: 20
  },
  inputGroup: {
    marginBottom: 16
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12
  },
  footerButton: {
    flex: 1
  },
  aiSection: {
    marginTop: 8,
    marginBottom: 16
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary
  },
  aiButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary
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
  }
});