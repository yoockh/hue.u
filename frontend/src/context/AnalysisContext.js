import React, { createContext, useState } from 'react';

export const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Cross-flow hand-off for the Product tab's tone features. A pending intent is
  // parked here when the user leaves the Product tab to run/attach an analysis,
  // and consumed by ProductScreen when it regains focus.
  //   { mode: 'filter' | 'tryOn', productId?: number, season?: string }
  // - season present  -> resolve immediately (source already known, skip dialog)
  // - season absent    -> wait for a fresh analysis, then use its season
  const [matchIntent, setMatchIntent] = useState(null);

  return (
    <AnalysisContext.Provider value={{
      analysisResult, setAnalysisResult,
      selectedProduct, setSelectedProduct,
      matchIntent, setMatchIntent
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};
