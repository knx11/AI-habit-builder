import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';

export default function TimerScreen() {
  const { tasks, pomodoroSettings, updatePomodoroSettings } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Filter only incomplete tasks
  const activeTasks = tasks.filter((task) => !task.completed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const handleTaskPress = (taskId: string) => {
    setSelectedTaskId(taskId);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Pomodoro Timer',
        }}
      />
      
      <View style={styles.timerContainer}>
        <PomodoroTimer />
      </View>
      
      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Active Tasks</Text>
        
        {activeTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No active tasks. Add tasks to start working on them.
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem task={item} onPress={() => handleTaskPress(item.id)} />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
      
      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  timerContainer: {
    padding: 16,
  },
  tasksSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textLight,
    textAlign: 'center',
  },
});