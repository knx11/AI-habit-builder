import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import TaskForm from '@/components/TaskForm';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Filter = 'all' | 'active' | 'completed';

type CategoryFilter = 'all' | string;

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, autoAssignPriorities, completeTask } = useTaskStore();
  const [filter, setFilter] = useState<Filter>('active');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);

  // Auto-sort tasks by priority when the component mounts or tasks change
  useEffect(() => {
    autoAssignPriorities();
  }, [tasks.length]);

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    tasks.forEach(t => { if (t.category && t.category.trim().length > 0) set.add(t.category.trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const base = tasks.filter((task) => {
      switch (filter) {
        case 'active':
          return !task.completed;
        case 'completed':
          return task.completed;
        default:
          return true;
      }
    });

    const byCategory = categoryFilter === 'all' ? base : base.filter(t => (t.category ?? '').trim() === categoryFilter);

    return byCategory;
  }, [tasks, filter, categoryFilter]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Tasks',
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

      <View style={styles.filters}>
        <View style={styles.filterChips}>
          {(['all', 'active', 'completed'] as Filter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.activeFilter]}
              onPress={() => setFilter(f)}
              testID={`filter-${f}`}
            >
              <Text 
                style={[
                  styles.filterText,
                  filter === f && styles.activeFilterText
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.categoryWrapper}>
          <TouchableOpacity
            style={[styles.filterButton, styles.categoryButton, showCategoryMenu && styles.activeFilter]}
            onPress={() => setShowCategoryMenu(v => !v)}
            accessibilityRole="button"
            testID="category-dropdown-toggle"
          >
            <Text style={[styles.filterText, showCategoryMenu && styles.activeFilterText]}>
              {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
            </Text>
          </TouchableOpacity>
          {showCategoryMenu && (
            <View style={styles.dropdown} testID="category-dropdown-menu">
              <TouchableOpacity
                onPress={() => { setCategoryFilter('all'); setShowCategoryMenu(false); }}
                style={styles.dropdownItem}
                testID="category-option-all"
              >
                <Text style={styles.dropdownText}>All Categories</Text>
              </TouchableOpacity>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setCategoryFilter(c); setShowCategoryMenu(false); }}
                  style={styles.dropdownItem}
                  testID={`category-option-${c}`}
                >
                  <Text style={styles.dropdownText}>{c}</Text>
                </TouchableOpacity>
              ))}
              {categories.length === 0 && (
                <View style={styles.dropdownItem}>
                  <Text style={styles.dropdownTextMuted}>No categories</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => setSelectedTaskId(item.id)}
            onLongPress={() => setSelectedTaskId(item.id)}
            onComplete={(completed) => completeTask(item.id, completed)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddTask(true)}
      >
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>

      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />

      <TaskForm
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
      />
    </GestureHandlerRootView>
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
  filters: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 1,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  categoryWrapper: {
    marginLeft: 'auto',
    position: 'relative',
  },
  categoryButton: {
    minWidth: 140,
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 180,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    color: colors.text,
    fontSize: 14,
  },
  dropdownTextMuted: {
    color: colors.textLight,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 34,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});