import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CalendarScreen() {
  const router = useRouter();
  const { tasks } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Get week dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get tasks for selected date
  const tasksForDate = tasks.filter(task => {
    const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
    return isSameDay(taskDate, selectedDate);
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Calendar',
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

      {/* Rest of your existing calendar code remains the same */}
    </SafeAreaView>
  );
}