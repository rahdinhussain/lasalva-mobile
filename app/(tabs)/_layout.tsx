import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { Calendar, Users, Briefcase, Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function TabsLayout() {
  const { isAuthenticated, isLoading, isHydrated } = useAuth();

  // Wait for auth hydration to complete before making routing decisions
  if (isLoading || !isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.indigo[600],
        tabBarInactiveTintColor: colors.slate[500],
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <Calendar
              size={22}
              color={focused ? colors.indigo[600] : colors.slate[500]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="staff"
        options={{
          title: 'Staff',
          tabBarIcon: ({ focused }) => (
            <Users
              size={22}
              color={focused ? colors.indigo[600] : colors.slate[500]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ focused }) => (
            <Briefcase
              size={22}
              color={focused ? colors.indigo[600] : colors.slate[500]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <Settings
              size={22}
              color={focused ? colors.indigo[600] : colors.slate[500]}
            />
          ),
        }}
      />
    </Tabs>
  );
}
