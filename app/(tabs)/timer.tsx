import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import PomodoroTimer from '@/components/PomodoroTimer';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function TimerScreen() {
  const router = useRouter();
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
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={{ marginRight: 16 }}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {/* Rest of your existing code remains the same */}
    </SafeAreaView>
  );
}