import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, ChevronDown, Check } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  Layout,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskForm from '@/components/TaskForm';
import TaskDetails from '@/components/TaskDetails';
import FeedbackToast from '@/components/FeedbackToast';
import useFeedback from '@/hooks/useFeedback';

type FilterType = 'all' | 'active' | 'completed';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const router = useRouter();
  const { tasks } = useTaskStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { feedback, showFeedback, hideFeedback } = useFeedback();
  
  // Get unique categories from tasks
  const categories = ['All Categories', ...Array.from(new Set(tasks.map(task => task.category).filter(Boolean)))];
  
  // Filter tasks based on selected filter and category
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    switch (filter) {
      case 'all':
        // Show only non-completed tasks for "All"
        filteredTasks = tasks.filter(task => !task.completed);
        break;
      case 'active':
        filteredTasks = tasks.filter(task => !task.completed);
        break;
      case 'completed':
        filteredTasks = tasks.filter(task => task.completed);
        break;
      default:
        filteredTasks = tasks;
    }
    
    // Apply category filter if selected
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filteredTasks = filteredTasks.filter(task => task.category === selectedCategory);
    }
    
    // Sort by creation date, newest first
    return filteredTasks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };
  
  const filteredTasks = getFilteredTasks();
  
  const handleTaskFormSuccess = () => {
    showFeedback('Task created successfully', 'success');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === 'All Categories' ? null : category);
    setShowCategoryDropdown(false);
  };

  const renderFilterButton = (filterType: FilterType, label: string) => {
    const isActive = filter === filterType;
    
    if (filterType === 'all') {
      return (
        <View style={styles.allFilterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              isActive && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text
              style={[
                styles.filterButtonText,
                isActive && styles.activeFilterButtonText,
              ]}
            >
              {selectedCategory || label}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              isActive && styles.activeDropdownButton,
            ]}
            onPress={() => setShowCategoryDropdown(true)}
          >
            <ChevronDown 
              size={16} 
              color={isActive ? colors.background : colors.textLight} 
            />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.activeFilterButton,
        ]}
        onPress={() => setFilter(filterType)}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.activeFilterButtonText,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const getEmptyMessage = () => {
    if (filter === 'active') {
      return 'No active tasks';
    } else if (filter === 'completed') {
      return 'No completed tasks';
    } else if (selectedCategory) {
      return `No tasks in ${selectedCategory}`;
    } else {
      return 'No tasks yet';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Tasks',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            color: colors.text,
            fontSize: 28,
            fontWeight: 'bold',
          },
        }}
      />
      
      <Animated.View 
        style={styles.header}
        entering={FadeIn.duration(500)}
      >
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('active', 'Active')}
          {renderFilterButton('completed', 'Completed')}
        </View>
      </Animated.View>
      
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={Platform.OS === 'web' ? FadeIn.delay(index * 100) : SlideInRight.delay(index * 100)}
            exiting={Platform.OS === 'web' ? FadeOut : SlideOutLeft}
            layout={Platform.OS === 'web' ? undefined : Layout.springify()}
          >
            <TaskItem
              task={item}
              onPress={() => setSelectedTaskId(item.id)}
              onLongPress={() => {}}
            />
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Animated.View 
            style={styles.emptyContainer}
            entering={FadeIn.duration(800)}
          >
            <Text style={styles.emptyText}>
              {getEmptyMessage()}
            </Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first task
            </Text>
          </Animated.View>
        )}
      />
      
      <AnimatedTouchableOpacity
        style={styles.fab}
        onPress={() => setShowTaskForm(true)}
        activeOpacity={0.8}
        entering={FadeIn.delay(600).duration(400)}
      >
        <Plus size={24} color="#fff" />
      </AnimatedTouchableOpacity>
      
      <TaskForm
        visible={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSuccess={handleTaskFormSuccess}
      />
      
      <TaskDetails
        visible={!!selectedTaskId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
      
      <FeedbackToast
        message={feedback.message}
        visible={feedback.visible}
        onHide={hideFeedback}
        type={feedback.type}
      />

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <Animated.View 
            style={styles.dropdownModal}
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
          >
            <Text style={styles.dropdownTitle}>Select Category</Text>
            {categories.map((category, index) => (
              <Animated.View
                key={category}
                entering={FadeIn.delay(index * 50)}
              >
                <TouchableOpacity
                  style={styles.categoryOption}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.categoryOptionText}>{category}</Text>
                  {((category === 'All Categories' && !selectedCategory) || 
                    (selectedCategory !== null && category === selectedCategory)) && (
                    <Check size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  allFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 0,
    marginLeft: -1,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeDropdownButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 120 : 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    maxWidth: 300,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryOptionText: {
    fontSize: 16,
    color: colors.text,
  },
});