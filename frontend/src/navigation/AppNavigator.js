import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SkinAnalysisScreen from '../screens/SkinAnalysisScreen';
import AnalysisResultScreen from '../screens/AnalysisResultScreen';
import ProductCatalogScreen from '../screens/ProductCatalogScreen';
import UploadFullBodyScreen from '../screens/UploadFullBodyScreen';
import TryOnResultScreen from '../screens/TryOnResultScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SkinAnalysis" screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
        <Stack.Screen name="SkinAnalysis" component={SkinAnalysisScreen} options={{ title: 'Hue.U Analysis' }} />
        <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} options={{ title: 'Your Result' }} />
        <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} options={{ title: 'Shop' }} />
        <Stack.Screen name="UploadFullBody" component={UploadFullBodyScreen} options={{ title: 'Virtual Try-On' }} />
        <Stack.Screen name="TryOnResult" component={TryOnResultScreen} options={{ title: 'Try-On Result' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
