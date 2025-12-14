import React, { createContext, useContext, useState } from 'react';

interface PerformanceSettings {
  reduceAnimations: boolean;
  disableParticles: boolean;
  disableMatrixRain: boolean;
  setReduceAnimations: (reduce: boolean) => void;
  setDisableParticles: (disable: boolean) => void;
  setDisableMatrixRain: (disable: boolean) => void;
}

const PerformanceContext = createContext<PerformanceSettings | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [disableParticles, setDisableParticles] = useState(false);
  const [disableMatrixRain, setDisableMatrixRain] = useState(false);

  const value: PerformanceSettings = {
    reduceAnimations,
    disableParticles,
    disableMatrixRain,
    setReduceAnimations,
    setDisableParticles,
    setDisableMatrixRain,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = (): PerformanceSettings => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};