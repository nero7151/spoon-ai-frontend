'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const validateToken = useCallback(async (token: string) => {
    try {
      console.log('Validating token:', token.substring(0, 20) + '...');
      
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Token validation response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('Token validation successful, user data:', userData);
        
        setUser({
          id: userData.id.toString(),
          username: userData.username,
          email: userData.email
        });
      } else {
        console.log('Token validation failed, removing token');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Checking for existing token on mount:', token ? 'found' : 'not found');
    
    if (token) {
      // Validate token with backend
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, [validateToken]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', { username });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data);
        
        localStorage.setItem('token', data.access_token);
        
        // Get user profile
        const profileResponse = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
          },
        });

        console.log('Profile response status:', profileResponse.status);

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          console.log('Profile data:', userData);
          
          setUser({
            id: userData.id.toString(),
            username: userData.username,
            email: userData.email
          });
          return true;
        } else {
          console.error('Profile fetch failed');
        }
      } else {
        console.error('Login failed with status:', response.status);
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
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
