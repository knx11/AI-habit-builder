import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import AnalyticsCard from '@/components/AnalyticsCard';
import BarChart from '@/components/BarChart';
import PieChart from '@/components/PieChart';
import { 
  formatTime, 
  calculateProductivityScore,
  getTimeSpentByCategory,
  generateWeeklyStats
} from '@/utils/helpers';
import { getProductivityInsights } from '@/services/aiService';

type TimeRange = 'day' | 'week' | 'month';

export default function AnalyticsScreen() {
  const { tasks, dailyStats, timeBlocks } = useTaskStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  // Calculate stats based on the selected time range
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    let startDate: string;
    if (timeRange === 'day') {
      startDate = today;
    } else if (timeRange === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      startDate = weekStart.toISOString();
    } else {
      const monthStart = new Date(now);
      monthStart.setMonth(now.getMonth() - 1);
      startDate = monthStart.toISOString();
    }
    
    return { startDate, endDate: now.toISOString() };
  };
  
  const { startDate, endDate } = getDateRange();
  
  // Calculate stats
  const completedTasks = tasks.filter(
    (task) => task.completed && task.createdAt >= startDate && task.createdAt <= endDate
  ).length;
  
  const totalTasks = tasks.filter(
    (task) => task.createdAt >= startDate && task.createdAt <= endDate
  ).length;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const totalTimeSpent = tasks.reduce((total, task) => {
    if (task.createdAt >= startDate && task.createdAt <= endDate) {
      return total + (task.actualMinutes || 0);
    }
    return total;
  }, 0);
  
  const totalEstimatedTime = tasks.reduce((total, task) => {
    if (task.createdAt >= startDate && task.createdAt <= endDate) {
      return total + task.estimatedMinutes;
    }
    return total;
  }, 0);
  
  const productivityScore = calculateProductivityScore(
    completedTasks,
    totalTasks,
    totalTimeSpent,
    totalEstimatedTime
  );
  
  const timeByCategory = getTimeSpentByCategory(tasks, startDate, endDate);
  
  // Prepare chart data
  const weeklyStats = generateWeeklyStats(tasks, dailyStats);
  
  const categoryData = Object.entries(timeByCategory).map(([category, minutes]) => ({
    label: category,
    value: minutes,
    color: category === 'Work' ? colors.primary : 
           category === 'Personal' ? colors.secondary : 
           category === 'Study' ? '#6C63FF' : 
           category === 'Health' ? '#4CAF50' : 
           category === 'Home' ? '#FF9800' : 
           colors.accent,
  }));
  
  // Get AI insights
  useEffect(() => {
    const fetchInsights = async () => {
      if (totalTasks === 0) {
        setInsights("Add tasks to get personalized productivity insights.");
        return;
      }
      
      setIsLoadingInsights(true);
      try {
        const result = await getProductivityInsights(
          completedTasks,
          totalTasks,
          productivityScore,
          timeByCategory
        );
        setInsights(result);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setInsights("Based on your recent activity, try to break larger tasks into smaller, more manageable pieces.");
      } finally {
        setIsLoadingInsights(false);
      }
    };
    
    fetchInsights();
  }, [timeRange, completedTasks, totalTasks, productivityScore]);
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Productivity Analytics',
        }}
      />
      
      <View style={styles.timeRangeSelector}>
        <TouchableOpacity
          style={[styles.rangeButton, timeRange === 'day' && styles.activeRange]}
          onPress={() => setTimeRange('day')}
        >
          <Text
            style={[
              styles.rangeText,
              timeRange === 'day' && styles.activeRangeText,
            ]}
          >
            Day
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.rangeButton, timeRange === 'week' && styles.activeRange]}
          onPress={() => setTimeRange('week')}
        >
          <Text
            style={[
              styles.rangeText,
              timeRange === 'week' && styles.activeRangeText,
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.rangeButton,
            timeRange === 'month' && styles.activeRange,
          ]}
          onPress={() => setTimeRange('month')}
        >
          <Text
            style={[
              styles.rangeText,
              timeRange === 'month' && styles.activeRangeText,
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <AnalyticsCard
                title="Productivity Score"
                value={`${productivityScore}%`}
                subtitle="Based on completion & time"
                icon={<TrendingUp size={24} color={colors.primary} />}
              />
            </View>
            
            <View style={styles.statsCol}>
              <AnalyticsCard
                title="Completion Rate"
                value={`${Math.round(completionRate)}%`}
                subtitle={`${completedTasks}/${totalTasks} tasks`}
                icon={<CheckCircle size={24} color={colors.secondary} />}
                color={colors.secondary}
              />
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <AnalyticsCard
                title="Time Spent"
                value={formatTime(totalTimeSpent)}
                subtitle="Total working time"
                icon={<Clock size={24} color={colors.accent} />}
                color={colors.accent}
              />
            </View>
            
            <View style={styles.statsCol}>
              <AnalyticsCard
                title="Efficiency"
                value={totalEstimatedTime > 0 
                  ? `${Math.round((totalEstimatedTime / Math.max(totalTimeSpent, 1)) * 100)}%` 
                  : 'N/A'}
                subtitle="Estimated vs actual time"
                icon={<Calendar size={24} color="#6C63FF" />}
                color="#6C63FF"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Performance</Text>
          <BarChart
            data={weeklyStats.data}
            labels={weeklyStats.labels}
            barColor={colors.primary}
          />
        </View>
        
        {categoryData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time by Category</Text>
            <PieChart data={categoryData} />
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productivity Insights</Text>
          <View style={styles.insightsCard}>
            {isLoadingInsights ? (
              <Text style={styles.loadingText}>Generating insights...</Text>
            ) : (
              <Text style={styles.insightsText}>{insights}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeRange: {
    backgroundColor: colors.primary,
  },
  rangeText: {
    color: colors.text,
    fontWeight: '500',
  },
  activeRangeText: {
    color: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statsCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  insightsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightsText: {
    color: colors.text,
    lineHeight: 22,
  },
  loadingText: {
    color: colors.textLight,
    fontStyle: 'italic',
  },
});