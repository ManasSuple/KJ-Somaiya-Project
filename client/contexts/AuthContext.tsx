import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import supabase from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  name?: string | null;
  role?: 'faculty' | 'super_admin';
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return false;
    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email ?? "", name: data.user.user_metadata?.full_name ?? null });
      return true;
    }
    return false;
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  const isAuthenticated = !!user;

  const hasRole = (_role: 'faculty' | 'super_admin') => {
    // Role handling can be extended if you store roles in user metadata or a separate table
    return !!user; // For now, any authenticated user passes role checks
  };

  // Initialize from existing Supabase session and subscribe to auth changes
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? "", name: data.user.user_metadata?.full_name ?? null });
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "", name: session.user.user_metadata?.full_name ?? null });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
