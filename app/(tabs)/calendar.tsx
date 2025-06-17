import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';

export default function CalendarScreen() {
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
        }}
      />

      <View style={styles.calendar}>
        <View style={styles.weekDays}>
          {weekDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                isSameDay(date, selectedDate) && styles.selectedDay,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={styles.dayName}>{format(date, 'EEE')}</Text>
              <Text 
                style={[
                  styles.dayNumber,
                  isSameDay(date, selectedDate) && styles.selectedDayText,
                ]}
              >
                {format(date, 'd')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.taskList}>
          <Text style={styles.dateHeader}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </Text>

          {tasksForDate.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tasks scheduled for this day</Text>
            </View>
          ) : (
            tasksForDate.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onPress={() => setSelectedTaskId(task.id)}
                onLongPress={() => setSelectedTaskId(task.id)}
              />
            ))
          )}
        </View>
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
  calendar: {
    flex: 1,
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedDayText: {
    color: colors.background,
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textLight,
    fontSize: 16,
  },
});