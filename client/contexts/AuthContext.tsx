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
    // First try Supabase auth.users
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      setUser({ id: data.user.id, email: data.user.email ?? "", name: data.user.user_metadata?.full_name ?? null });
      // Clear any student local session if present, to avoid ambiguity
      try { localStorage.removeItem('student_user'); } catch {}
      return true;
    }

    // Fallback 1: secure RPC that validates against public.students with SECURITY DEFINER
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('login_student', {
        p_email: email,
        p_password: password,
      });
      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        const s = rpcData[0] as { id: string; email: string; department?: string };
        const studentUser: User = { id: s.id, email: s.email, department: s.department };
        setUser(studentUser);
        try { localStorage.setItem('student_user', JSON.stringify(studentUser)); } catch {}
        return true;
      }
    } catch {}

    // Fallback 2: direct select from public.students (requires permissive RLS). Not recommended but kept as last resort.
    try {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id,email,department')
        .eq('email', email)
        .eq('password', password)
        .single();
      if (!studentError && student) {
        const studentUser: User = { id: student.id, email: student.email, department: student.department };
        setUser(studentUser);
        try { localStorage.setItem('student_user', JSON.stringify(studentUser)); } catch {}
        return true;
      }
    } catch {}

    return false;
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    try { localStorage.removeItem('student_user'); } catch {}
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
      } else {
        // Restore student session from localStorage if present
        try {
          const raw = localStorage.getItem('student_user');
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<User>;
            if (parsed && parsed.id && parsed.email) {
              setUser({ id: String(parsed.id), email: String(parsed.email), department: parsed.department });
            }
          }
        } catch {}
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "", name: session.user.user_metadata?.full_name ?? null });
      } else {
        // If no Supabase session, check if a student local session exists
        try {
          const raw = localStorage.getItem('student_user');
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<User>;
            if (parsed && parsed.id && parsed.email) {
              setUser({ id: String(parsed.id), email: String(parsed.email), department: parsed.department });
              return;
            }
          }
        } catch {}
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
