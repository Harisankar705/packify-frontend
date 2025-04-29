import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, userService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string, isAdminLogin?: boolean) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  googleLogin: async () => {},
  logout: () => {},
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            const response = await userService.getProfile();
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error('Error loading user', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string, isAdminLogin = false) => {
    try {
      const response = await authService.login({ email, password });
      const { token: authToken, user: userData } = response.data;
      
      // For admin login, check if user has admin role
      if (isAdminLogin && userData.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      
      setToken(authToken);
      setUser(userData);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
    } catch (error: any) {
      console.error('Login error', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Login failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      const { token: authToken, user: newUser } = response.data;
      
      setToken(authToken);
      setUser(newUser);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: 'Success',
        description: 'Registration successful!',
      });
    } catch (error: any) {
      console.error('Registration error', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await authService.googleLogin(token);
      const { token: authToken, user: userData } = response.data;
      
      setToken(authToken);
      setUser(userData);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: 'Success',
        description: 'Logged in successfully with Google!',
      });
    } catch (error: any) {
      console.error('Google login error', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Google login failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: 'Success',
      description: 'Logged out successfully!',
    });
  };

  const updateUser = async (userData: any) => {
    try {
      const response = await userService.updateProfile(userData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (error: any) {
      console.error('Update profile error', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
