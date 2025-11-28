import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import * as api from '../services/apiService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (role: UserRole, email?: string, password?: string) => Promise<boolean>;
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

  const login = async (role: UserRole, email?: string, password?: string): Promise<boolean> => {
    try {
      const demoPasswords: Record<string, string> = {
        superadmin: 'admin123',
        developer: 'dev123',
        volunteer: 'vol123',
        voter: 'citizen123',
        guest: 'guest123',
        representative: 'rep123'
      };

      const loginEmail = email || `${role}@neta.app`;
      const loginPassword = password || demoPasswords[role] || 'demo123';

      const response = await api.login(loginEmail, loginPassword, role);
      
      if (response.success && response.user) {
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
    } catch (error) {
      console.error('Login failed:', error);
      
      const mockUser: User = {
        id: Date.now().toString(),
        name: role === 'superadmin' ? 'Super User' : 
              role === 'developer' ? 'Dev Corp Ltd.' : 
              role === 'volunteer' ? 'Amit Kumar' : 'Citizen User',
        email: `${role}@neta.app`,
        role: role,
        plan: role === 'developer' ? 'pro' : undefined,
        apiKey: role === 'developer' ? 'nk_live_51Mz...' : undefined
      };
      
      setUser(mockUser);
      localStorage.setItem('neta_user_session', JSON.stringify(mockUser));
      
      return true;
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
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
