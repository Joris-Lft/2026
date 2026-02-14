import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  // Rediriger vers la connexion si l'utilisateur n'est pas authentifié
  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/Login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="Habit"
        options={{
          title: "Habits",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Measure"
        options={{
          title: "Measure",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="ruler.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
