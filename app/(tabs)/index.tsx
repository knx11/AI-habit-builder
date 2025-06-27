import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskDetails from '@/components/TaskDetails';
import TaskForm from '@/components/TaskForm';
import Button from '@/components/Button';

type Filter = 'all' | 'active' | 'completed';

export default function HomeScreen() {
  const router = useRouter();
  const { tasks = [] } = useTaskStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Get unique categories from tasks, excluding duplicates
  const taskCategories = Array.from(new Set(tasks.map(task => task.category || 'Other')));
  
  // Create a separate array for the category filter that includes 'All'
  const filterCategories = ['All', ...taskCategories];

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
    if (selectedCategory && selectedCategory !== 'All') {
      filteredTasks = filteredTasks.filter(task => task.category === selectedCategory);
    }
    
    // Sort by priority and creation date
    return filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2, optional: 3 };
      const aPriority = a.priority ? priorityOrder[a.priority] : 4;
      const bPriority = b.priority ? priorityOrder[b.priority] : 4;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
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
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'all' && styles.activeFilter,
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
                styles.filterButton,
                filter === 'active' && styles.activeFilter,
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
          </ScrollView>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {filterCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category === selectedCategory ? '' : category)}
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
        
        <Button
          title="Add New Task"
          onPress={() => setShowAddTask(true)}
          style={styles.addButton}
        />
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
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    marginRight: 8,
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
  categoriesScroll: {
    flexGrow: 0,
    marginBottom: 16,
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
  },
});