import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'faculty' | 'super_admin';
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: 'faculty' | 'super_admin') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@somaiya.edu',
    role: 'faculty',
    department: 'Computer Science Engineering'
  },
  {
    id: '2',
    name: 'Prof. Priya Sharma',
    email: 'priya.sharma@somaiya.edu',
    role: 'super_admin',
    department: 'Administration'
  },
  {
    id: '3',
    name: 'Dr. Amit Patel',
    email: 'amit.patel@somaiya.edu',
    role: 'faculty',
    department: 'Mechanical Engineering'
  }
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call your backend
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'admin123') {
      setUser(foundUser);
      localStorage.setItem('admin_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  const isAuthenticated = !!user;

  const hasRole = (role: 'faculty' | 'super_admin') => {
    if (!user) return false;
    if (role === 'faculty') return user.role === 'faculty' || user.role === 'super_admin';
    return user.role === role;
  };

  // Check for existing session on mount
  useState(() => {
    const savedUser = localStorage.getItem('admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  });

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
