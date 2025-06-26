import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import { Settings } from 'lucide-react-native';
import FeedbackToast from '@/components/FeedbackToast';
import useFeedback from '@/hooks/useFeedback';

export default function TimerScreen() {
  const router = useRouter();
  const { tasks } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const { feedback, showFeedback, hideFeedback } = useFeedback();
  
  // Filter only incomplete tasks
  const activeTasks = tasks.filter((task) => !task.completed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const handleTaskPress = (taskId: string) => {
    setSelectedTaskId(taskId);
    showFeedback('Task selected for timer', 'info');
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Timer',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
          },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={styles.headerButton}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.timerSection}>
          <PomodoroTimer taskId={selectedTaskId} />
        </View>
        
        <View style={styles.taskListContainer}>
          <Text style={styles.sectionTitle}>Active Tasks</Text>
          <FlatList
            data={activeTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onPress={() => handleTaskPress(item.id)}
                onLongPress={() => {}}
              />
            )}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No active tasks</Text>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
      
      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId || null}
        onClose={() => setSelectedTaskId(undefined)}
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
  timerSection: {
    marginBottom: 24,
  },
  taskListContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 40,
    fontSize: 16,
  },
});