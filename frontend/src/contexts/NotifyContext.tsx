import React, { createContext, useContext } from 'react';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface NotifyContextValue {
  notify: (message: string, severity?: Severity) => void;
}

const NotifyContext = createContext<NotifyContextValue | undefined>(undefined);

interface NotifyProviderProps {
  children: React.ReactNode;
  onNotify: (message: string, severity?: Severity) => void;
}

export const NotifyProvider: React.FC<NotifyProviderProps> = ({ children, onNotify }) => {
  const value = React.useMemo(() => ({ notify: onNotify }), [onNotify]);
  return <NotifyContext.Provider value={value}>{children}</NotifyContext.Provider>;
};

export const useNotify = () => {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify must be used within NotifyProvider');
  return ctx.notify;
};