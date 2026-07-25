import React, { createContext, useState } from 'react';

export const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <AnalysisContext.Provider value={{
      analysisResult, setAnalysisResult,
      selectedProduct, setSelectedProduct
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};
