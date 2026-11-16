import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { safeApiCall } from '../utils/api';

interface LoginResult {
  success: boolean;
  role?: UserRole;
  error?: string;
}

interface RegisterResult {
  success: boolean;
  role?: UserRole;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, rememberMe?: boolean, requestedRole?: UserRole) => Promise<LoginResult>;
  register: (data: any) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  // Modal fallback for quick actions
  isAuthModalOpen: boolean;
  authModalDefaultRole: UserRole;
  openAuthModal: (defaultRole?: UserRole) => void;
  closeAuthModal: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal support for backwards-compatibility
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<UserRole>('brand');

  const role: UserRole | null = user ? user.role : null;
  const isAuthenticated = !!user;

  // On initial mount: verify session with backend
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const result = await safeApiCall<{ user?: User }>('/auth/me');

        if (result.ok && result.data?.user) {
          if (isMounted) {
            setUser(result.data.user);
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem('cb_token');
          sessionStorage.removeItem('cb_token');
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (
    email: string,
    password = 'password123',
    rememberMe = true,
    requestedRole?: UserRole
  ): Promise<LoginResult> => {
    try {
      const result = await safeApiCall<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe, requestedRole })
      });

      if (!result.ok) {
        return {
          success: false,
          error: result.error || 'Login failed. Please check your credentials.'
        };
      }

      const data = result.data;

      // Store token based on rememberMe policy
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('cb_token', data.token);
          sessionStorage.removeItem('cb_token');
        } else {
          sessionStorage.setItem('cb_token', data.token);
          localStorage.removeItem('cb_token');
        }
      }

      setUser(data.user);
      setIsAuthModalOpen(false);

      return {
        success: true,
        role: data.user.role
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to authentication server.'
      };
    }
  };

  const register = async (formData: any): Promise<RegisterResult> => {
    try {
      const result = await safeApiCall<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (!result.ok) {
        return {
          success: false,
          error: result.error || 'Registration failed. Please check your inputs.'
        };
      }

      const data = result.data;

      if (data.token) {
        localStorage.setItem('cb_token', data.token);
      }

      setUser(data.user);
      setIsAuthModalOpen(false);

      return {
        success: true,
        role: data.user.role
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to authentication server.'
      };
    }
  };

  const logout = async () => {
    try {
      await safeApiCall('/auth/logout', {
        method: 'POST'
      });
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('cb_token');
      sessionStorage.removeItem('cb_token');
      localStorage.removeItem('cb_user');
      setUser(null);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const switchRole = async (newRole: UserRole) => {
    try {
      const result = await safeApiCall<{ user: User; token?: string }>('/auth/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role: newRole })
      });

      if (result.ok && result.data?.user) {
        setUser(result.data.user);
        if (result.data.token) {
          localStorage.setItem('cb_token', result.data.token);
        }
      }
    } catch (err) {}
  };

  const openAuthModal = (defaultRole: UserRole = 'brand') => {
    setAuthModalDefaultRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        isAuthModalOpen,
        authModalDefaultRole,
        openAuthModal,
        closeAuthModal,
        switchRole
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
