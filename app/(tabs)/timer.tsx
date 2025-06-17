import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';

export default function TimerScreen() {
  const { tasks } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  
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
      
      <View style={styles.content}>
        <PomodoroTimer taskId={selectedTaskId} />
        
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
          />
        </View>
      </View>
      
      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId || null}
        onClose={() => setSelectedTaskId(undefined)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskListContainer: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 20,
  },
});