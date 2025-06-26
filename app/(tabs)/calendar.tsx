import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import { Settings } from 'lucide-react-native';

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
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Calendar',
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
        <View style={styles.calendar}>
          {weekDates.map((date) => (
            <TouchableOpacity
              key={date.toISOString()}
              style={[
                styles.dateButton,
                isSameDay(date, selectedDate) && styles.selectedDate,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={styles.dayText}>{format(date, 'EEE')}</Text>
              <Text style={styles.dateText}>{format(date, 'd')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.taskList}>
          {tasksForDate.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onPress={() => setSelectedTaskId(task.id)}
              onLongPress={() => {}}
            />
          ))}
          {tasksForDate.length === 0 && (
            <Text style={styles.emptyText}>No tasks for this date</Text>
          )}
        </ScrollView>
      </View>

      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
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
    padding: 16,
  },
  headerButton: {
    marginRight: 16,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
  },
  dateButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  selectedDate: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  taskList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 20,
  },
});