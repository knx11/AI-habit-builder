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
import { StyleSheet, Platform, View } from "react-native";

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
  
  const { tasks, dailyStats } = useTaskStore();
  
  // Initialize with mock data if empty
  useEffect(() => {
    if (tasks.length === 0) {
      const mockTasks = generateMockTasks();
      mockTasks.forEach((task) => {
        useTaskStore.getState().addTask({
          title: task.title,
          description: task.description,
          category: task.category,
          estimatedMinutes: task.estimatedMinutes,
        });
      });
    }
    
    if (dailyStats.length === 0) {
      const mockStats = generateMockStats();
      mockStats.forEach((stat) => {
        useTaskStore.getState().addDailyStats(stat);
      });
    }
  }, []);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}