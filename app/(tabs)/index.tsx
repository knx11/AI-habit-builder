import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Settings, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import TaskForm from '@/components/TaskForm';

type FilterType = 'all' | 'active' | 'completed';

export default function IndexScreen() {
  const router = useRouter();
  const { tasks } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Tasks',
          headerTitleStyle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
          },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={styles.settingsButton}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.content}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'all' && styles.activeFilterTab
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[
              styles.filterText,
              activeFilter === 'all' && styles.activeFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'active' && styles.activeFilterTab
            ]}
            onPress={() => setActiveFilter('active')}
          >
            <Text style={[
              styles.filterText,
              activeFilter === 'active' && styles.activeFilterText
            ]}>
              Active
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'completed' && styles.activeFilterTab
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text style={[
              styles.filterText,
              activeFilter === 'completed' && styles.activeFilterText
            ]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onPress={() => setSelectedTaskId(item.id)}
              onLongPress={() => {}}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddTask(true)}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

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
  content: {
    flex: 1,
    position: 'relative',
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  activeFilterText: {
    color: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});