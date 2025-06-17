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
  const router = useRouter();
  const { tasks, reorderTasks, autoAssignPriorities, sortTasksByPriority } = useTaskStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isReordering, setIsReordering] = useState(false);
  const [sortBy, setSortBy] = useState<'order' | 'priority'>('order');

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
      
      {/* Rest of your existing code */}
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
});