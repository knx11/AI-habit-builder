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
  ActivityIndicator
} from 'react-native';
import { X, Clock, Calendar, Zap } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import Button from '@/components/Button';
import { useTaskStore } from '@/store/taskStore';
import { formatTime, estimateTaskTime } from '@/utils/helpers';
import { generateTaskBreakdown } from '@/services/aiService';

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TaskForm({ visible, onClose, onSuccess }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [category, setCategory] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState('');
  
  const { addTask, addAIGeneratedSubTasks } = useTaskStore();
  
  const categories = [
    'Work', 'Personal', 'Study', 'Health', 'Home', 'Other'
  ];
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEstimatedMinutes(30);
    setCategory('');
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
    });
    
    resetForm();
    if (onSuccess) onSuccess();
    onClose();
  };
  
  const handleAIBreakdown = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    setIsGeneratingAI(true);
    setError('');
    
    try {
      const result = await generateTaskBreakdown(title, description);
      
      const taskId = addTask({
        title,
        description,
        estimatedMinutes: result.totalEstimatedMinutes,
        category: category || 'Other',
      });
      
      addAIGeneratedSubTasks(
        taskId,
        result.subTasks
      );
      
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('AI breakdown error:', err);
      setError('Failed to generate AI breakdown. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  const handleEstimateTime = () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    const estimated = estimateTaskTime(title, description);
    setEstimatedMinutes(estimated);
  };
  
  const adjustTime = (amount: number) => {
    setEstimatedMinutes(Math.max(5, estimatedMinutes + amount));
  };
  
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Task</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.form}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textLight}
            />
            
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details about this task..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.selectedCategory,
                  ]}
                  onPress={() => setCategory(cat)}
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
            
            <View style={styles.timeSection}>
              <View style={styles.timeHeader}>
                <Text style={styles.label}>Estimated Time</Text>
                <TouchableOpacity 
                  style={styles.estimateButton}
                  onPress={handleEstimateTime}
                >
                  <Clock size={14} color={colors.primary} />
                  <Text style={styles.estimateButtonText}>Auto Estimate</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeControls}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => adjustTime(-5)}
                >
                  <Text style={styles.timeButtonText}>-5m</Text>
                </TouchableOpacity>
                
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeText}>{formatTime(estimatedMinutes)}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => adjustTime(5)}
                >
                  <Text style={styles.timeButtonText}>+5m</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Create Task"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
            
            <Button
              title="AI Breakdown"
              onPress={handleAIBreakdown}
              variant="outline"
              style={styles.aiButton}
              loading={isGeneratingAI}
              icon={!isGeneratingAI && <Zap size={18} color={colors.primary} />}
            />
          </View>
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
  form: {
    padding: 20,
    maxHeight: '70%',
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
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedCategoryText: {
    color: colors.background,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  estimateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateButtonText: {
    color: colors.primary,
    marginLeft: 4,
    fontSize: 14,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  timeDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  footer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    flex: 1,
    marginRight: 8,
  },
  aiButton: {
    flex: 1,
    marginLeft: 8,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
  },
});