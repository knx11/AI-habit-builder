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

// ... rest of your imports ...

export default function AnalyticsScreen() {
  const router = useRouter();
  
  // ... rest of your existing code ...

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Productivity Analytics',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={{ marginRight: 16 }}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {/* Rest of your existing code remains the same */}
    </SafeAreaView>
  );
}