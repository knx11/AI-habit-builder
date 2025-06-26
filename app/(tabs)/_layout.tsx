import { Tabs } from 'expo-router';
import { TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Settings, CheckSquare, Timer, Calendar, BarChart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();
  
  // Get status bar height
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            style={styles.headerButton}
          >
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        headerStyle: {
          backgroundColor: colors.background,
          height: Platform.OS === 'ios' ? 90 : 60 + statusBarHeight,
          paddingTop: statusBarHeight,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 24,
          fontWeight: 'bold',
        },
        headerTitleContainerStyle: {
          paddingHorizontal: 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => <Timer size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <BarChart size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
});