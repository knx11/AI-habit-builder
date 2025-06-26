import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import { Settings } from 'lucide-react-native';

export default function TimerScreen() {
  const router = useRouter();
  const { tasks } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  
  // Filter only incomplete tasks
  const activeTasks = tasks.filter((task) => !task.completed)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const handleTaskPress = (taskId: string) => {
    setSelectedTaskId(taskId);
  };
  
  // Calculate content padding
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const headerHeight = Platform.OS === 'ios' ? 90 : 60 + statusBarHeight;
  const tabBarHeight = Platform.OS === 'ios' ? 80 : 60;
  
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
      
      <View style={[
        styles.content,
        { 
          paddingTop: headerHeight + 16,
          paddingBottom: tabBarHeight + 16,
        }
      ]}>
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
  },
  headerButton: {
    marginRight: 16,
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