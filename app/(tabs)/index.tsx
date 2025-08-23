import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Settings, Check, ChevronDown } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import TaskForm from '@/components/TaskForm';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type Filter = 'all' | 'active' | 'completed';
 type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export default function TasksScreen() {
  const router = useRouter();
  const { tasks, autoAssignPriorities, completeTask } = useTaskStore();
  const [filter, setFilter] = useState<Filter>('active');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  // Auto-sort tasks by priority when the component mounts or tasks change
  useEffect(() => {
    autoAssignPriorities();
  }, [tasks.length]);

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    tasks.forEach(t => {
      if ((t.category ?? '').trim().length > 0) set.add((t.category ?? '').trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const filteredTasks = tasks
    .filter((task) => {
      switch (filter) {
        case 'active':
          return !task.completed;
        case 'completed':
          return task.completed;
        default:
          return true;
      }
    })
    .filter((task) => {
      if (filter !== 'all') return true;
      if (category === 'all') return true;
      return (task.category ?? '').trim() === category;
    })
    .filter((task) => {
      if (priorityFilter === 'all') return true;
      return (task.priority ?? 'low') === priorityFilter;
    });

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
        {(['all', 'active', 'completed'] as Filter[]).map((f) => {
          const isAll = f === 'all';
          const isActive = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, isActive && styles.activeFilter]}
              onPress={() => {
                setFilter(f);
                if (isAll) {
                  setShowCategoryMenu(prev => !prev || !isActive);
                } else {
                  setShowCategoryMenu(false);
                }
              }}
              testID={`filter-${f}`}
            >
              <View style={styles.filterContentRow}>
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.activeFilterText,
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
                {isAll && (
                  <ChevronDown size={16} color={isActive ? colors.background : colors.text} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {filter === 'all' && showCategoryMenu && (
        <View style={styles.dropdownContainer} testID="category-dropdown">
          <TouchableOpacity
            style={[styles.dropdownItem, category === 'all' && styles.dropdownItemActive]}
            onPress={() => { setCategory('all'); setShowCategoryMenu(false); }}
            testID="category-option-all"
          >
            <Text style={[styles.dropdownText, category === 'all' && styles.dropdownTextActive]}>All Categories</Text>
            {category === 'all' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.dropdownItem, category === c && styles.dropdownItemActive]}
              onPress={() => { setCategory(c); setShowCategoryMenu(false); }}
              testID={`category-option-${c.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <Text style={[styles.dropdownText, category === c && styles.dropdownTextActive]}>{c}</Text>
              {category === c && <Check size={16} color={colors.primary} />}
            </TouchableOpacity>
          ))}
          {categories.length === 0 && (
            <View style={styles.dropdownEmpty}>
              <Text style={styles.dropdownEmptyText}>No categories yet</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.priorityFilters}>
        {(['all','high','medium','low'] as PriorityFilter[]).map((p) => {
          const isActive = priorityFilter === p;
          const label = p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1);
          return (
            <TouchableOpacity
              key={p}
              style={[styles.filterButton, isActive && styles.activeFilter]}
              onPress={() => setPriorityFilter(p)}
              testID={`priority-${p}`}
            >
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    padding: 16,
    gap: 8,
    zIndex: 2,
  },
  priorityFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    zIndex: 1,
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
  filterContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownContainer: {
    marginHorizontal: 16,
    marginTop: -8,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemActive: {
    backgroundColor: colors.background,
  },
  dropdownText: {
    color: colors.text,
    fontSize: 14,
  },
  dropdownTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  dropdownEmpty: {
    padding: 12,
  },
  dropdownEmptyText: {
    color: colors.textLight,
    fontSize: 12,
    textAlign: 'center',
  },
});