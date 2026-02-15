import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabse";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initializing: boolean;
  isResettingPassword: boolean;
  setIsResettingPassword: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  initializing: true,
  isResettingPassword: false,
  setIsResettingPassword: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // 🔥 Add flag to prevent multiple initializations
  const initialized = useRef(false);

  useEffect(() => {
    // 🔥 Guard against multiple executions
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setInitializing(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // 🔥 Empty dependency array

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        initializing,
        isResettingPassword,
        setIsResettingPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
