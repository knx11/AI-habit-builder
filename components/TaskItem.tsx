import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Clock, MoreVertical } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types/task';
import { colors } from '@/constants/colors';
import { formatTime, calculateTaskProgress } from '@/utils/helpers';
import ProgressBar from '@/components/ProgressBar';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

export default function TaskItem({ task, onPress }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { completeTask, completeSubTask } = useTaskStore();
  
  const progress = calculateTaskProgress(task);
  const hasSubTasks = task.subTasks.length > 0;
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  const toggleTaskCompletion = (e: any) => {
    e.stopPropagation();
    completeTask(task.id, !task.completed);
  };
  
  const toggleSubTaskCompletion = (subTaskId: string, completed: boolean, e: any) => {
    e.stopPropagation();
    completeSubTask(task.id, subTaskId, !completed);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.taskHeader} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Pressable onPress={toggleTaskCompletion} hitSlop={10}>
          {task.completed ? (
            <CheckCircle size={24} color={colors.primary} />
          ) : (
            <Circle size={24} color={colors.primary} />
          )}
        </Pressable>
        
        <View style={styles.taskContent}>
          <Text 
            style={[
              styles.taskTitle, 
              task.completed && styles.completedText
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          
          {hasSubTasks && (
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} />
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}
        </View>
        
        <View style={styles.taskActions}>
          <View style={styles.timeContainer}>
            <Clock size={14} color={colors.textLight} />
            <Text style={styles.timeText}>{formatTime(task.estimatedMinutes)}</Text>
          </View>
          
          {hasSubTasks && (
            <TouchableOpacity onPress={toggleExpanded} hitSlop={10}>
              {expanded ? (
                <ChevronUp size={20} color={colors.textLight} />
              ) : (
                <ChevronDown size={20} color={colors.textLight} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
      
      {expanded && hasSubTasks && (
        <View style={styles.subTasksContainer}>
          {task.subTasks.map((subTask) => (
            <View key={subTask.id} style={styles.subTaskItem}>
              <Pressable 
                onPress={(e) => toggleSubTaskCompletion(subTask.id, subTask.completed, e)}
                hitSlop={10}
              >
                {subTask.completed ? (
                  <CheckCircle size={18} color={colors.primary} />
                ) : (
                  <Circle size={18} color={colors.primary} />
                )}
              </Pressable>
              
              <Text 
                style={[
                  styles.subTaskTitle, 
                  subTask.completed && styles.completedText
                ]}
                numberOfLines={1}
              >
                {subTask.title}
              </Text>
              
              <Text style={styles.subTaskTime}>
                {formatTime(subTask.estimatedMinutes)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 8,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  subTasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subTaskTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  subTaskTime: {
    fontSize: 12,
    color: colors.textLight,
  },
});