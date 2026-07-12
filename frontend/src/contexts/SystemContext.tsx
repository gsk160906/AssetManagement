import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface SystemContextProps {
  isInitialized: boolean | null; // null = still loading
  setIsInitialized: (val: boolean) => void;
}

const SystemContext = createContext<SystemContextProps | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await api.get('/system/setup-status');
        if (response.data?.success) {
          setIsInitialized(response.data.data.initialized);
        } else {
          // Unexpected response shape — fail safe: assume initialized
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Failed to retrieve setup status:', err);
        // Network error / backend down — fail safe so users aren't locked out
        setIsInitialized(true);
      }
    };
    checkSetupStatus();
  }, []);

  return (
    <SystemContext.Provider value={{ isInitialized, setIsInitialized }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
