import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Gender } from '@chat-app/shared';
import { auth as authApi } from '../services/api';
import { socketService } from '../services/socket';

interface GuestLoginData {
  gender: Gender;
  countryId: number;
  stateId?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: (data: GuestLoginData) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    username: string;
    gender: Gender;
    dateOfBirth: string;
    countryId?: number;
    stateId?: number;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const connectSocket = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await socketService.connect(token);
      } catch (error) {
        console.error('Failed to connect socket:', error);
      }
    }
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      await connectSocket();
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, [connectSocket]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
    await connectSocket();
  };

  const loginAsGuest = async (data: GuestLoginData) => {
    const response = await authApi.guest(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
    await connectSocket();
  };

  const register = async (data: {
    email: string;
    password: string;
    username: string;
    gender: Gender;
    dateOfBirth: string;
    countryId?: number;
    stateId?: number;
  }) => {
    const response = await authApi.register(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
    await connectSocket();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    socketService.disconnect();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginAsGuest,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
