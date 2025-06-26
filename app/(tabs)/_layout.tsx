import { Tabs } from 'expo-router';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Settings, CheckSquare, Timer, Calendar, BarChart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            style={[styles.headerButton, { marginTop: insets.top }]}
          >
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.background,
          height: Platform.OS === 'ios' ? 100 : 80,
          paddingTop: insets.top,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 24,
          fontWeight: 'bold',
          marginTop: insets.top,
        },
        headerTitleContainerStyle: {
          paddingHorizontal: 16,
          paddingTop: insets.top,
        },
        tabBarLabelStyle: {
          fontSize: 12,
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