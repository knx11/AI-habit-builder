import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Settings, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import TaskForm from '@/components/TaskForm';

type Filter = 'all' | 'active' | 'completed';

export default function HomeScreen() {
  const router = useRouter();
  const { tasks = [] } = useTaskStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Get unique categories from tasks, excluding duplicates
  const categories = Array.from(new Set(tasks.map(task => task.category || 'Other')));
  
  // Filter tasks based on completion status and category
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    // First filter by completion status
    switch (filter) {
      case 'active':
        filteredTasks = tasks.filter(task => !task.completed);
        break;
      case 'completed':
        filteredTasks = tasks.filter(task => task.completed);
        break;
    }
    
    // Then apply category filter if selected
    if (selectedCategory) {
      filteredTasks = filteredTasks.filter(task => task.category === selectedCategory);
    }
    
    return filteredTasks;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Tasks',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 28,
            fontWeight: 'bold',
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
        <View style={styles.filters}>
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === 'all' && styles.activeFilterTab,
              ]}
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
              style={[
                styles.filterTab,
                filter === 'active' && styles.activeFilterTab,
              ]}
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
                styles.filterTab,
                filter === 'completed' && styles.activeFilterTab,
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
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory('')}
            >
              <Text
                style={[
                  styles.categoryText,
                  !selectedCategory && styles.selectedCategoryText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <FlatList
          data={getFilteredTasks()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onPress={() => setSelectedTaskId(item.id)}
              onLongPress={() => setSelectedTaskId(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'all'
                  ? "Add a new task to get started"
                  : filter === 'active'
                  ? "No active tasks"
                  : "No completed tasks"}
              </Text>
            </View>
          )}
        />
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddTask(true)}
        >
          <Text style={styles.addButtonText}>Add New Task</Text>
        </TouchableOpacity>
      </View>
      
      <TaskForm
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
      />
      
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
    padding: 8,
  },
  filters: {
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeFilterText: {
    color: colors.background,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.categoryBackground,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.categoryText,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: colors.background,
  },
  list: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});