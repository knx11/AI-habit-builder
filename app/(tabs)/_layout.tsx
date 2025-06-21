import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ClipboardList, Clock, BarChart2, Calendar } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 24,
          fontWeight: '600',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} />
          ),
          tabBarLabel: 'Tasks',
        }}
      />
      
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color, size }) => (
            <Clock size={size} color={color} />
          ),
          tabBarLabel: 'Timer',
        }}
      />
      
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <BarChart2 size={size} color={color} />
          ),
          tabBarLabel: 'Analytics',
        }}
      />
      
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
          tabBarLabel: 'Calendar',
        }}
      />
    </Tabs>
  );
}