import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '../components/CustomAlert';

// App-wide alert host. Mounts a single CustomAlert and exposes an imperative
// showAlert(), so screens can trigger a themed dialog the same way they used to
// call Alert.alert — but styled to the design system and reusable everywhere
// (errors, validation, future success/info messages).
const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null); // { type, title, message, buttons } | null

  const showAlert = useCallback((config) => {
    setAlert({ type: 'info', ...config });
  }, []);

  const hideAlert = useCallback(() => setAlert(null), []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={!!alert}
        type={alert?.type}
        title={alert?.title}
        message={alert?.message}
        buttons={alert?.buttons}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return ctx;
};
