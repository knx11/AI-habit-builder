import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Filter, ArrowUpDown, ListFilter, Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskForm from '@/components/TaskForm';
import TaskDetails from '@/components/TaskDetails';
import * as Haptics from 'expo-haptics';

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, reorderTasks, autoAssignPriorities, sortTasksByPriority } = useTaskStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isReordering, setIsReordering] = useState(false);
  const [sortBy, setSortBy] = useState<'order' | 'priority'>('order');

  // Force a re-render after initial load to ensure tasks are displayed
  useEffect(() => {
    const timer = setTimeout(() => {
      // This empty setState forces a re-render
      setSortBy(current => current);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleSortMode = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSortBy(current => current === 'order' ? 'priority' : 'order');
    if (sortBy === 'order') {
      sortTasksByPriority();
    }
  };

  const toggleReorderMode = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsReordering(!isReordering);
  };

  const handleAutoRankAndSort = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    autoAssignPriorities();
    sortTasksByPriority();
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'My Tasks',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push('/settings')}
              >
                <Settings size={24} color={colors.text} />
              </TouchableOpacity>
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
      
      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onPress={() => setSelectedTaskId(item.id)}
              onLongPress={() => setIsReordering(true)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add a new task</Text>
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowTaskForm(true)}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <TaskForm
        visible={showTaskForm}
        onClose={() => setShowTaskForm(false)}
      />

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
  content: {
    flex: 1,
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  autoRankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  autoRankText: {
    color: colors.background,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});