import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { Stack } from 'expo-router';
import { Plus, Filter, ArrowUpDown, ListFilter } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskForm from '@/components/TaskForm';
import TaskDetails from '@/components/TaskDetails';
import { Task } from '@/types/task';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';

export default function TasksScreen() {
  const { tasks, reorderTasks, autoAssignPriorities, sortTasksByPriority } = useTaskStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isReordering, setIsReordering] = useState(false);
  const [sortBy, setSortBy] = useState<'order' | 'priority'>('order');
  
  // Sort tasks by priority or order
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      // Sort by priority (high -> medium -> low -> optional)
      const priorityOrder = { high: 0, medium: 1, low: 2, optional: 3 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 4;
      const bPriority = b.priority ? priorityOrder[b.priority] : 4;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
    }
    
    // Then sort by order property
    if ((a.order || 0) !== (b.order || 0)) {
      return (a.order || 0) - (b.order || 0);
    }
    
    // Finally sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const filteredTasks = sortedTasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  
  const handleTaskPress = (taskId: string) => {
    if (isReordering) {
      // In reordering mode, don't open task details
      return;
    }
    setSelectedTaskId(taskId);
  };
  
  const handleCloseTaskDetails = () => {
    setSelectedTaskId(null);
  };
  
  const toggleReorderMode = () => {
    setIsReordering(!isReordering);
    if (!isReordering) {
      // When entering reorder mode, auto-assign priorities
      autoAssignPriorities();
    }
  };
  
  const toggleSortMode = () => {
    setSortBy(sortBy === 'order' ? 'priority' : 'order');
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAutoRankAndSort = () => {
    // Auto-assign priorities to all tasks
    autoAssignPriorities();
    
    // Switch to priority sorting
    setSortBy('priority');
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Tasks Auto-Ranked',
        'Tasks have been automatically ranked by priority and sorted'
      );
    }
  };
  
  const handleDragEnd = ({ data }: { data: Task[] }) => {
    // Update the order in the store
    const newTaskIds = data.map(task => task.id);
    reorderTasks(newTaskIds);
  };
  
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <TouchableOpacity
        onLongPress={isReordering ? drag : undefined}
        disabled={!isReordering}
        style={[isActive && styles.draggingItem]}
      >
        <TaskItem 
          task={item} 
          onPress={() => handleTaskPress(item.id)}
          onLongPress={() => handleTaskPress(item.id)}
        />
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'My Tasks',
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
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowTaskForm(true)}
              >
                <Plus size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'active' && styles.activeFilterText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && styles.activeFilter,
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'completed' && styles.activeFilterText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.priorityLegend}>
        <Text style={styles.legendTitle}>Priority:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3498db' }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f1c40f' }]} />
          <Text style={styles.legendText}>Medium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2ecc71' }]} />
          <Text style={styles.legendText}>Low</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#bdc3c7' }]} />
          <Text style={styles.legendText}>Optional</Text>
        </View>
      </View>
      
      {isReordering && (
        <View style={styles.reorderingBanner}>
          <Text style={styles.reorderingText}>
            Drag and drop to reorder tasks
          </Text>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => setIsReordering(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button to add your first task
          </Text>
        </View>
      ) : (
        isReordering ? (
          <DraggableFlatList
            data={filteredTasks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem 
                task={item} 
                onPress={() => handleTaskPress(item.id)}
                onLongPress={() => handleTaskPress(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )
      )}
      
      {/* Floating Action Button for adding tasks */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setShowTaskForm(true)}
      >
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>
      
      <TaskForm
        visible={showTaskForm}
        onClose={() => setShowTaskForm(false)}
      />
      
      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={handleCloseTaskDetails}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 16,
  },
  autoRankButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  autoRankText: {
    color: colors.background,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  addButton: {
    marginRight: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
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
  priorityLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legendTitle: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textLight,
  },
  reorderingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reorderingText: {
    color: colors.text,
    fontWeight: '500',
  },
  doneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  doneButtonText: {
    color: colors.background,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for floating button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  draggingItem: {
    opacity: 0.7,
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
});