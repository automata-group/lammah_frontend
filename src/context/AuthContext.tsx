"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

const IS_LOCAL_DEV = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLocalDev: boolean;
  signInWithGoogle: (nextPath?: string) => Promise<{ error: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, nextPath?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // 1. Instant session restoration from local cache (0ms delay)
      setSession(session);
      setUser(session.user);
      setLoading(false);

      // 2. Validate in background without stalling the app UI
      supabase.auth.getUser().then(({ data: userData, error: userError }) => {
        if (userError || !userData?.user) {
          supabase.auth.signOut();
          setSession(null);
          setUser(null);
        } else {
          setUser(userData.user);
        }
      }).catch(() => {});
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getURL = () => {
    let url = "";
    
    // 1. الأولوية للعنوان الحالي في المتصفح (الأكثر دقة وقت التشغيل)
    if (typeof window !== 'undefined') {
      url = window.location.origin;
    } 
    // 2. إذا لم يكن متصفحاً، استخدم المتغير البيئي
    else {
      url = process.env.NEXT_PUBLIC_SITE_URL || 'https://lammah.site';
    }

    // تنظيف الرابط
    if (!url.startsWith('http')) url = `https://${url}`;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  };

  const signInWithGoogle = async (nextPath = '/dashboard') => {
    const base = getURL();
    const cleanNext = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
    const redirectPath = `/auth/callback?next=${encodeURIComponent(cleanNext)}`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${base}${redirectPath}` },
    });
    return { error };
  };

  // ✅ تسجيل دخول محلي بالإيميل والباسوورد (لا يؤثر على الإنتاج)
  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, nextPath = '/dashboard') => {
    const cleanNext = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: `${getURL()}${cleanNext}` }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isLocalDev: IS_LOCAL_DEV, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be within AuthProvider");
  return context;
}
