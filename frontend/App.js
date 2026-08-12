import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AnalysisProvider } from './src/context/AnalysisContext';
import { AlertProvider } from './src/context/AlertContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AlertProvider>
        <AnalysisProvider>
          <AppNavigator />
        </AnalysisProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}
