import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, Settings, Check } from 'lucide-react-native';
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
  const [filter, setFilter] = useState<Filter>('all');
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

  const currentAllLabel = useMemo(() => {
    if (category !== 'all') return category;
    return 'All';
  }, [category]);

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


      {showCategoryMenu && (
        <View style={styles.dropdownContainer} testID="category-dropdown">
          <View style={styles.dropdownGroupHeader}>
            <Text style={styles.dropdownGroupHeaderText}>Status</Text>
          </View>
          <TouchableOpacity
            style={[styles.dropdownItem, filter === 'all' && category === 'all' && styles.dropdownItemActive]}
            onPress={() => { setFilter('all'); setCategory('all'); setShowCategoryMenu(false); }}
            testID="status-option-all"
          >
            <Text style={[styles.dropdownText, filter === 'all' && category === 'all' && styles.dropdownTextActive]}>All</Text>
            {filter === 'all' && category === 'all' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, filter === 'active' && styles.dropdownItemActive]}
            onPress={() => { setFilter('active'); setShowCategoryMenu(false); }}
            testID="status-option-active"
          >
            <Text style={[styles.dropdownText, filter === 'active' && styles.dropdownTextActive]}>Active</Text>
            {filter === 'active' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, filter === 'completed' && styles.dropdownItemActive]}
            onPress={() => { setFilter('completed'); setShowCategoryMenu(false); }}
            testID="status-option-completed"
          >
            <Text style={[styles.dropdownText, filter === 'completed' && styles.dropdownTextActive]}>Completed</Text>
            {filter === 'completed' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>

          <View style={styles.dropdownGroupHeader}>
            <Text style={styles.dropdownGroupHeaderText}>Categories</Text>
          </View>
          <TouchableOpacity
            style={[styles.dropdownItem, filter === 'all' && category === 'all' && styles.dropdownItemActive]}
            onPress={() => { setFilter('all'); setCategory('all'); setShowCategoryMenu(false); }}
            testID="category-option-all"
          >
            <Text style={[styles.dropdownText, filter === 'all' && category === 'all' && styles.dropdownTextActive]}>All Categories</Text>
            {filter === 'all' && category === 'all' && <Check size={16} color={colors.primary} />}
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.dropdownItem, filter === 'all' && category === c && styles.dropdownItemActive]}
              onPress={() => { setFilter('all'); setCategory(c); setShowCategoryMenu(false); }}
              testID={`category-option-${c.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <Text style={[styles.dropdownText, filter === 'all' && category === c && styles.dropdownTextActive]}>{c}</Text>
              {filter === 'all' && category === c && <Check size={16} color={colors.primary} />}
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
          const label = p === 'all' ? currentAllLabel : p.charAt(0).toUpperCase() + p.slice(1);

          const colorFor = (prio: PriorityFilter) => {
            switch (prio) {
              case 'high': {
                const base = colors.priorityHigh;
                const border = '#F59E0B' as const;
                const inactiveBg = '#FFFBEB' as const;
                return { base, textOn: colors.text, border, inactiveBg } as const;
              }
              case 'medium': {
                const base = colors.priorityMedium;
                const border = '#2563EB' as const;
                const inactiveBg = '#EFF6FF' as const;
                return { base, textOn: colors.background, border, inactiveBg } as const;
              }
              case 'low': {
                const base = colors.priorityLow;
                const border = '#16A34A' as const;
                const inactiveBg = '#ECFDF5' as const;
                return { base, textOn: colors.background, border, inactiveBg } as const;
              }
              default: {
                const base = colors.primary;
                const border = colors.primary;
                const inactiveBg = colors.cardBackground;
                return { base, textOn: colors.background, border, inactiveBg } as const;
              }
            }
          };
          const c = colorFor(p);

          const content = (
            <View style={styles.filterContentRow}>
              
              
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.activeFilterText,
                  p !== 'all' && !isActive && { color: p === 'high' ? c.border : c.base },
                  isActive && p !== 'all' && { color: c.textOn },
                ]}
              >
                {label}
              </Text>
              
            </View>
          );

          return (
            <TouchableOpacity
              key={p}
              style={[
                styles.filterButton,
                isActive && styles.activeFilter,
                p !== 'all' && {
                  borderColor: c.border,
                  backgroundColor: c.inactiveBg,
                },
                isActive && p !== 'all' && {
                  backgroundColor: c.base,
                  borderColor: c.base,
                },
              ]}
              onPress={() => {
                if (p === 'all') {
                  setPriorityFilter('all');
                  setShowCategoryMenu(prev => !prev);
                } else {
                  setShowCategoryMenu(false);
                  setPriorityFilter(p);
                }
              }}
              testID={p === 'all' ? 'filter-combined-all' : `priority-${p}`}
            >
              {content}
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
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
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
    gap: 8,
  },
  dropdownContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
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
  dropdownGroupHeader: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: colors.surface,
  },
  dropdownGroupHeaderText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dropdownEmptyText: {
    color: colors.textLight,
    fontSize: 12,
    textAlign: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
});