import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import * as api from '../services/apiService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (role: UserRole, email?: string, password?: string) => Promise<boolean>;
  loginWithFirebase: (role: UserRole, idToken: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('neta_user_session');
    const storedToken = localStorage.getItem('neta_auth_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const applySession = (response: any): boolean => {
    if (response?.success && response.user) {
      const loggedInUser: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as UserRole,
        plan: response.user.plan,
        apiKey: response.user.apiKey
      };
      setUser(loggedInUser);
      setToken(response.user.token);
      localStorage.setItem('neta_user_session', JSON.stringify(loggedInUser));
      localStorage.setItem('neta_auth_token', response.user.token);
      return true;
    }
    return false;
  };

  const login = async (role: UserRole, email?: string, password?: string): Promise<boolean> => {
    try {
      const loginEmail = email || `${role}@neta.ink`;
      const loginPassword = password || '';
      const response = await api.login(loginEmail, loginPassword, role);
      return applySession(response);
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const loginWithFirebase = async (role: UserRole, idToken: string): Promise<boolean> => {
    try {
      const response = await api.firebaseLogin(idToken, role);
      return applySession(response);
    } catch (error) {
      console.error('Firebase login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('neta_user_session');
    localStorage.removeItem('neta_auth_token');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithFirebase, logout, isLoading }}>
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
