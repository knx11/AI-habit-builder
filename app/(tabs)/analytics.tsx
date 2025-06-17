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
  ChevronRight,
  Settings
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useTaskStore } from '@/store/taskStore';
import AnalyticsCard from '@/components/AnalyticsCard';
import BarChart from '@/components/BarChart';
import PieChart from '@/components/PieChart';
import { generateWeeklyStats } from '@/utils/helpers';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { tasks, dailyStats } = useTaskStore();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Get weekly stats
  const weeklyStats = generateWeeklyStats(tasks, dailyStats);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Productivity Analytics',
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
      
      <ScrollView style={styles.content}>
        {/* Analytics content will go here */}
      </ScrollView>
    </SafeAreaView>
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
  },
});