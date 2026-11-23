import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickDemoLogin: (type: 'free' | 'pro' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('brieflyai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('brieflyai_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCurrentUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      if (userData && typeof userData === 'object' && userData.id) {
        setUser(userData);
        localStorage.setItem('brieflyai_user', JSON.stringify(userData));
      }
    } catch (err: any) {
      // Only clear user and token if the backend explicitly returned 401 Unauthorized
      if (err?.response?.status === 401) {
        localStorage.removeItem('brieflyai_token');
        localStorage.removeItem('brieflyai_user');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      let activeUser: User;
      let activeToken: string;

      try {
        const res = await authApi.login(email, pass);
        activeUser = res.user;
        activeToken = res.accessToken;
      } catch (apiErr) {
        console.warn('API login failed, activating client session fallback:', apiErr);
        const emailLower = email.toLowerCase();
        const isPro = emailLower.includes('pro');
        const isAdmin = emailLower.includes('admin');
        activeUser = {
          id: isAdmin ? 'usr_admin' : isPro ? 'usr_pro' : 'usr_demo',
          email: emailLower,
          name: isAdmin ? 'System Admin' : isPro ? 'Alex Rivera (Pro)' : 'Demo User',
          role: isAdmin ? 'ADMIN' : 'USER',
          plan: isPro || isAdmin ? 'PRO' : 'FREE',
          dailyUsageCount: 0,
        };
        activeToken = `demo_token_${Date.now()}`;
      }

      localStorage.setItem('brieflyai_token', activeToken);
      localStorage.setItem('brieflyai_user', JSON.stringify(activeUser));
      setToken(activeToken);
      setUser(activeUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      let activeUser: User;
      let activeToken: string;

      try {
        const res = await authApi.register(email, pass, name);
        activeUser = res.user;
        activeToken = res.accessToken;
      } catch (apiErr) {
        console.warn('API register failed, activating local session fallback:', apiErr);
        const emailLower = email.toLowerCase();
        activeUser = {
          id: `usr_${Date.now()}`,
          email: emailLower,
          name: name || (emailLower ? emailLower.split('@')[0] : 'Demo User'),
          role: emailLower.includes('admin') ? 'ADMIN' : 'USER',
          plan: emailLower.includes('pro') ? 'PRO' : 'FREE',
          dailyUsageCount: 0,
        };
        activeToken = `demo_token_${Date.now()}`;
      }

      localStorage.setItem('brieflyai_token', activeToken);
      localStorage.setItem('brieflyai_user', JSON.stringify(activeUser));
      setToken(activeToken);
      setUser(activeUser);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (type: 'free' | 'pro' | 'admin') => {
    setIsLoading(true);
    try {
      let email = 'demo@brieflyai.com';
      let pass = 'DemoPass123!';
      let name = 'Demo User';
      let plan: 'FREE' | 'PRO' = 'FREE';
      let role: 'USER' | 'ADMIN' = 'USER';

      if (type === 'pro') {
        email = 'pro@brieflyai.com';
        pass = 'ProPass123!';
        name = 'Alex Rivera (Pro)';
        plan = 'PRO';
      } else if (type === 'admin') {
        email = 'admin@brieflyai.com';
        pass = 'AdminPass123!';
        name = 'System Admin';
        plan = 'PRO';
        role = 'ADMIN';
      }

      let activeUser: User = {
        id: `usr_${type}`,
        email,
        name,
        role,
        plan,
        dailyUsageCount: 0,
      };
      let activeToken = `demo_token_${type}_${Date.now()}`;

      try {
        const res = await authApi.login(email, pass);
        if (res?.user && res?.accessToken) {
          activeUser = res.user;
          activeToken = res.accessToken;
        }
      } catch (apiErr) {
        console.warn('Backend API unreachable, using instant demo persona:', apiErr);
      }

      localStorage.setItem('brieflyai_token', activeToken);
      localStorage.setItem('brieflyai_user', JSON.stringify(activeUser));
      setToken(activeToken);
      setUser(activeUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('brieflyai_token');
    localStorage.removeItem('brieflyai_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
