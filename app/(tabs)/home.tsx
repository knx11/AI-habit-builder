import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Settings, TrendingUp, CheckCircle2, Clock } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import AnalyticsCard from '@/components/AnalyticsCard';

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, dailyStats } = useTaskStore();

  // Get today's stats
  const todayStats = dailyStats.length > 0 ? dailyStats[dailyStats.length - 1] : null;

  // Get high priority tasks
  const highPriorityTasks = tasks
    .filter(task => task.priority === 'high' && !task.completed)
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Home',
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

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.cards}>
            <AnalyticsCard
              title="Tasks Completed"
              value={todayStats?.totalTasksCompleted || 0}
              icon={<CheckCircle2 size={24} color={colors.primary} />}
            />
            <AnalyticsCard
              title="Time Spent"
              value={todayStats ? `${Math.floor(todayStats.totalTimeSpent / 60)}h ${todayStats.totalTimeSpent % 60}m` : "0h 0m"}
              icon={<Clock size={24} color={colors.secondary} />}
              color={colors.secondary}
            />
            <AnalyticsCard
              title="Productivity"
              value={`${todayStats?.productivityScore || 0}%`}
              icon={<TrendingUp size={24} color={colors.accent} />}
              color={colors.accent}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>High Priority Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/index')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {highPriorityTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onPress={() => router.push('/index')}
              onLongPress={() => {}}
            />
          ))}
          {highPriorityTasks.length === 0 && (
            <Text style={styles.emptyText}>No high priority tasks</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  cards: {
    marginTop: 16,
  },
  seeAllText: {
    color: colors.primary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 16,
  },
});