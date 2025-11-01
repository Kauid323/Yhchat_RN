import { userAPI } from '@/utils/apiClientMixed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  avatar_url: string;
  avatar_id: number;
  phone: string;
  email: string;
  coin: number;
  is_vip: number;
  vip_expired_time: number;
  invitation_code: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await refreshUserInfo();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('检查认证状态错误:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserInfo = async () => {
    try {
      const response = await userAPI.getUserInfo();
      console.log('用户信息响应:', response);
      
      if (response.status?.code === 1 && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        // Token可能已过期
        console.warn('用户信息获取失败，可能token过期');
        await logout();
      }
    } catch (error) {
      console.error('获取用户信息错误:', error);
      // 暂时设置默认用户，避免登录循环
      setUser({
        id: 'fallback_user',
        name: '用户',
        avatar_url: '',
        avatar_id: 0,
        phone: '',
        email: '',
        coin: 0,
        is_vip: 0,
        vip_expired_time: 0,
        invitation_code: ''
      });
      setIsAuthenticated(true);
    }
  };

  const login = async (token: string) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      await refreshUserInfo();
    } catch (error) {
      console.error('登录错误:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 调用登出API
      const deviceId = await AsyncStorage.getItem('deviceId') || 'unknown-device';
      try {
        await userAPI.logout(deviceId);
      } catch (error) {
        console.warn('登出API调用失败:', error);
      }

      // 清除本地存储
      await AsyncStorage.multiRemove([
        'userToken',
        'userEmail',
        'userPhone',
        'deviceId'
      ]);
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('登出错误:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUserInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
