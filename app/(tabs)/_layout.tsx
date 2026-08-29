import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#334155',
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="rutas"
        options={{
          title: 'Rutas',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🥾</Text>,
        }}
      />
      <Tabs.Screen
        name="insignias"
        options={{
          title: 'Insignias',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎖️</Text>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}