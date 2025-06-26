import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { generateMockTasks, generateMockStats } from "@/utils/mockData";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Platform, StatusBar, View } from "react-native";
import { colors } from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { tasks, dailyStats, addTask, addDailyStats } = useTaskStore();
  
  // Initialize with mock data if empty
  useEffect(() => {
    if (tasks.length === 0) {
      const mockTasks = generateMockTasks();
      mockTasks.forEach((task) => {
        addTask({
          title: task.title,
          description: task.description,
          category: task.category,
          estimatedMinutes: task.estimatedMinutes,
          priority: task.priority,
        });
      });
    }
    
    if (dailyStats.length === 0) {
      const mockStats = generateMockStats();
      mockStats.forEach((stat) => {
        addDailyStats(stat);
      });
    }
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Hide splash screen once everything is ready
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ 
              presentation: 'modal',
              title: 'Settings',
              headerShown: true,
              headerStyle: { backgroundColor: colors.background },
              headerTitleStyle: { color: colors.text }
            }} />
          </Stack>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});