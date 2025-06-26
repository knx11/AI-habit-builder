import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskForm from '@/components/TaskForm';
import TaskDetails from '@/components/TaskDetails';
import FeedbackToast from '@/components/FeedbackToast';
import useFeedback from '@/hooks/useFeedback';

export default function HomeScreen() {
  const router = useRouter();
  const { tasks } = useTaskStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { feedback, showFeedback, hideFeedback } = useFeedback();
  
  // Sort tasks by creation date, newest first
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Calculate content padding to account for status bar and tab bar
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const headerHeight = Platform.OS === 'ios' ? 90 : 60 + statusBarHeight;
  const tabBarHeight = Platform.OS === 'ios' ? 80 : 60;
  
  const handleTaskFormSuccess = () => {
    showFeedback('Task created successfully', 'success');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Tasks',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
      
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => setSelectedTaskId(item.id)}
            onLongPress={() => {}}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { 
            paddingTop: headerHeight + 16,
            paddingBottom: tabBarHeight + 88,
          }
        ]}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No tasks yet</Text>
        )}
      />
      
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: tabBarHeight + 24 }
        ]}
        onPress={() => setShowTaskForm(true)}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
      
      <TaskForm
        visible={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSuccess={handleTaskFormSuccess}
      />
      
      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
      
      <FeedbackToast
        message={feedback.message}
        visible={feedback.visible}
        onHide={hideFeedback}
        type={feedback.type}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});