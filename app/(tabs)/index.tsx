import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Settings, Filter, ArrowUpDown, ListFilter } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import TaskForm from '@/components/TaskForm';

export default function IndexScreen() {
  const router = useRouter();
  const { tasks } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [sortMode, setSortMode] = useState(false);

  const toggleReorderMode = () => {
    setIsReordering(!isReordering);
  };

  const toggleSortMode = () => {
    setSortMode(!sortMode);
  };

  const handleAutoRankAndSort = () => {
    // Implementation for auto ranking and sorting
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Tasks</Text>
              <TouchableOpacity 
                onPress={() => router.push('/settings')}
                style={styles.settingsButton}
              >
                <Settings size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={[styles.headerButton, styles.autoRankButton]}
                onPress={handleAutoRankAndSort}
              >
                <ListFilter size={20} color={colors.background} />
                <Text style={styles.autoRankText}>Auto Rank</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={toggleSortMode}
              >
                <Filter size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={toggleReorderMode}
              >
                <ArrowUpDown size={24} color={isReordering ? colors.primary : colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => setSelectedTaskId(item.id)}
            onLongPress={toggleReorderMode}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />

      <TaskForm
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        onSuccess={() => setShowAddTask(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  settingsButton: {
    padding: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  autoRankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  autoRankText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
});