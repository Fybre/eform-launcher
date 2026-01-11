import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="house.fill" color={color} />,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      />
      <Tabs.Screen
        name="manage-forms"
        options={{
          title: 'Manage',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="square.and.pencil" color={color} />,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="gear" color={color} />,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      />
    </Tabs>
  );
}
