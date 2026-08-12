import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import TabNavigator from './TabNavigator';
import SkinAnalysisScreen from '../screens/SkinAnalysisScreen';
import AnalysisResultScreen from '../screens/AnalysisResultScreen';
import ProductCatalogScreen from '../screens/ProductCatalogScreen';
import UploadFullBodyScreen from '../screens/UploadFullBodyScreen';
import TryOnResultScreen from '../screens/TryOnResultScreen';
import Wordmark from '../components/Wordmark';
import colors from '../constants/colors';

const Stack = createStackNavigator();

// Root stack. The app opens on the bottom-tab navigator ("Tabs"); the analysis
// flow screens are pushed on top of the tabs and keep the shared Hue.U wordmark
// header. (The About screen is added as a modal in a later task.)
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Tabs" screenOptions={{
        headerTitle: () => <Wordmark />,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primaryStrong,
        headerShadowVisible: true,
        headerBackTitleStyle: { color: colors.primaryStrong },
      }}>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="SkinAnalysis" component={SkinAnalysisScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} options={{ title: 'Your Result' }} />
        <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} options={{ title: 'Shop' }} />
        <Stack.Screen name="UploadFullBody" component={UploadFullBodyScreen} options={{ title: 'Virtual Try-On' }} />
        <Stack.Screen name="TryOnResult" component={TryOnResultScreen} options={{ title: 'Try-On Result' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
