import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  StatusBar
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Settings
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import AnalyticsCard from '@/components/AnalyticsCard';
import BarChart from '@/components/BarChart';
import { generateWeeklyStats } from '@/utils/helpers';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { tasks, dailyStats } = useTaskStore();

  // Get weekly stats
  const weeklyStats = generateWeeklyStats(tasks, dailyStats);

  // Calculate content padding
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
  const headerHeight = Platform.OS === 'ios' ? 90 : 60 + statusBarHeight;
  const tabBarHeight = Platform.OS === 'ios' ? 80 : 60;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Analytics',
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
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{
          paddingTop: headerHeight + 16,
          paddingBottom: tabBarHeight + 16,
        }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <BarChart 
            data={weeklyStats.data}
            labels={weeklyStats.labels}
            barColor={colors.primary}
          />
        </View>
        
        <View style={styles.cardsContainer}>
          <AnalyticsCard
            title="Tasks Completed"
            value={dailyStats.length > 0 ? dailyStats[dailyStats.length - 1].totalTasksCompleted : 0}
            subtitle="Today"
            icon={<CheckCircle size={24} color={colors.primary} />}
          />
          
          <AnalyticsCard
            title="Time Spent"
            value={dailyStats.length > 0 ? 
              `${Math.floor(dailyStats[dailyStats.length - 1].totalTimeSpent / 60)}h ${dailyStats[dailyStats.length - 1].totalTimeSpent % 60}m` : 
              "0h 0m"}
            subtitle="Today"
            icon={<Clock size={24} color={colors.secondary} />}
            color={colors.secondary}
          />
          
          <AnalyticsCard
            title="Productivity Score"
            value={dailyStats.length > 0 ? `${dailyStats[dailyStats.length - 1].productivityScore}%` : "0%"}
            subtitle="Today"
            icon={<TrendingUp size={24} color={colors.accent} />}
            color={colors.accent}
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
  },
  headerButton: {
    marginRight: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  cardsContainer: {
    marginBottom: 24,
  },
});