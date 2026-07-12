import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setOnUnauthorized } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
  employee_code: string;
  department_id: string | null;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    // Bind Axios 401 callback to update React state
    setOnUnauthorized((isExpired) => {
      setUser(null);
      if (isExpired) {
        setAuthError('Your session has expired. Please sign in again.');
      } else {
        setAuthError(null);
      }
    });

    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.success && response.data?.data) {
        const { token, user: loggedUser } = response.data.data;
        localStorage.setItem('token', token);
        setUser(loggedUser);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore background errors on logout
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setAuthError(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
        login,
        logout,
        refreshUser,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
