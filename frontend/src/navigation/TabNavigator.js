import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProductScreen from '../screens/ProductScreen';
import Wordmark from '../components/Wordmark';
import FloatingGlassTabBar from '../components/FloatingGlassTabBar';
import colors from '../constants/colors';

const Tab = createBottomTabNavigator();

// Ionicons (filled when focused, outline otherwise) — same family used elsewhere.
const TAB_ICONS = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  History: { active: 'time', inactive: 'time-outline' },
  Product: { active: 'shirt', inactive: 'shirt-outline' },
};

// The three primary tabs. The default bar is replaced by the floating glass
// capsule (FloatingGlassTabBar); each tab screen paints its own pastel gradient
// background, so the scene container is left transparent.
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <FloatingGlassTabBar {...props} />}
    sceneContainerStyle={{ backgroundColor: 'transparent' }}
    screenOptions={({ route }) => ({
      headerTitle: () => <Wordmark />,
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: colors.surface },
      headerShadowVisible: true,
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
