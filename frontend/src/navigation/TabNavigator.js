import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProductScreen from '../screens/ProductScreen';
import Wordmark from '../components/Wordmark';
import colors from '../constants/colors';
import typography from '../constants/typography';

const Tab = createBottomTabNavigator();

// Ionicons (filled when focused, outline otherwise) — same family used elsewhere.
const TAB_ICONS = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  History: { active: 'time', inactive: 'time-outline' },
  Product: { active: 'shirt', inactive: 'shirt-outline' },
};

// The three primary tabs. Each shows the shared Hue.U wordmark header; the
// analysis flow and the About screen live above this in the root stack.
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerTitle: () => <Wordmark />,
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: colors.surface },
      headerShadowVisible: true,
      tabBarActiveTintColor: colors.primaryStrong,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingTop: 6,
      },
      tabBarLabelStyle: { ...typography.caption },
      tabBarIcon: ({ focused, color, size }) => {
        const set = TAB_ICONS[route.name];
        return <Ionicons name={focused ? set.active : set.inactive} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Product" component={ProductScreen} />
  </Tab.Navigator>
);

export default TabNavigator;
