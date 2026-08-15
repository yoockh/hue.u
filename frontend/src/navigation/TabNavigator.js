import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProductScreen from '../screens/ProductScreen';
import AccountScreen from '../screens/AccountScreen';
import Wordmark from '../components/Wordmark';
import NotificationBell from '../components/NotificationBell';
import FloatingGlassTabBar from '../components/FloatingGlassTabBar';
import colors from '../constants/colors';

const Tab = createBottomTabNavigator();

// Ionicons (filled when focused, outline otherwise) — same family used elsewhere.
const TAB_ICONS = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  Product: { active: 'shirt', inactive: 'shirt-outline' },
  Camera: { active: 'camera', inactive: 'camera-outline' },
  History: { active: 'time', inactive: 'time-outline' },
  Account: { active: 'person', inactive: 'person-outline' },
};

// The center "Camera" tab is never actually rendered as a screen — the floating
// tab bar intercepts its slot and opens the analysis flow instead — so it just
// needs a placeholder component.
const CameraTabPlaceholder = () => null;

// Five primary tabs: Dashboard · Product · Camera(FAB) · History · Account.
// The default bar is replaced by the floating glass capsule; each tab screen
// paints its own pastel gradient, so the scene container stays transparent. A
// notification bell sits top-right on every tab's header.
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <FloatingGlassTabBar {...props} />}
    sceneContainerStyle={{ backgroundColor: 'transparent' }}
    screenOptions={({ route }) => ({
      headerTitle: () => <Wordmark />,
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: colors.surface },
      headerShadowVisible: true,
      headerRight: () => <NotificationBell />,
      tabBarIcon: ({ focused, color, size }) => {
        const set = TAB_ICONS[route.name];
        if (!set) return null;
        return <Ionicons name={focused ? set.active : set.inactive} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Product" component={ProductScreen} />
    <Tab.Screen name="Camera" component={CameraTabPlaceholder} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Account" component={AccountScreen} />
  </Tab.Navigator>
);

export default TabNavigator;
