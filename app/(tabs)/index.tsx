import React, { useState, useCallback } from 'react';
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
import { Plus, Filter, ArrowUpDown, ListFilter, Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import TaskItem from '@/components/TaskItem';
import TaskForm from '@/components/TaskForm';
import TaskDetails from '@/components/TaskDetails';
import { Task } from '@/types/task';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

export default function TasksScreen() {
  // Add router
  const router = useRouter();
  
  // Rest of the code remains the same, just add the settings button to Stack.Screen
  const { tasks, reorderTasks, autoAssignPriorities, sortTasksByPriority } = useTaskStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isReordering, setIsReordering] = useState(false);
  const [sortBy, setSortBy] = useState<'order' | 'priority'>('order');

  // ... rest of your existing code ...

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
                style={styles.headerButton}
                onPress={() => router.push('/settings')}
              >
                <Settings size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      {/* Rest of your existing code remains the same */}
    </SafeAreaView>
  );
}