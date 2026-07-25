import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AnalysisProvider } from './src/context/AnalysisContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AnalysisProvider>
        <AppNavigator />
      </AnalysisProvider>
    </SafeAreaProvider>
  );
}
