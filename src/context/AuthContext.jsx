import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false); // Renamed internally to mean "local mode"

  const fetchProfile = async (userId) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setProfile(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('expense-tracker-local-session');
    let savedLocal = null;
    if (savedSession) {
      try {
        savedLocal = JSON.parse(savedSession);
      } catch {
        localStorage.removeItem('expense-tracker-local-session');
      }
    }

    if (!isSupabaseConfigured) {
      // No real backend available — the only valid session is a local one.
      if (savedLocal) {
        setUser(savedLocal.user);
        setProfile(savedLocal.profile);
        setIsDemo(Boolean(savedLocal.isDemo));
      }
      setLoading(false);
      return;
    }

    // Supabase IS configured — a real session always takes priority over
    // any leftover local/guest session, and we must always listen for
    // auth changes so signIn/signUp are reflected immediately.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsDemo(false);
        fetchProfile(session.user.id);
      } else if (savedLocal?.isDemo) {
        // No real session, but the person previously chose "continue as
        // guest" — honor that until they explicitly sign in/out.
        setUser(savedLocal.user);
        setProfile(savedLocal.profile);
        setIsDemo(true);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setIsDemo(false);
          localStorage.removeItem('expense-tracker-local-session');
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      const localUser = {
        id: 'local-' + Date.now(),
        email,
        user_metadata: { full_name: fullName },
      };
      const localProfile = {
        id: localUser.id,
        full_name: fullName,
        currency: '₹',
      };
      setUser(localUser);
      setProfile(localProfile);
      setIsDemo(true);
      localStorage.setItem(
        'expense-tracker-local-session',
        JSON.stringify({ user: localUser, profile: localProfile, isDemo: true })
      );
      return { user: localUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (data?.user) {
        localStorage.removeItem('expense-tracker-local-session');
        setUser(data.user);
        setIsDemo(false);
        await fetchProfile(data.user.id);
      }
      return data;
    } catch (err) {
      if (err.message?.includes('fetch') || err.message?.includes('API key') || err.status === 400) {
        const localUser = {
          id: 'local-' + Date.now(),
          email,
          user_metadata: { full_name: fullName },
        };
        const localProfile = {
          id: localUser.id,
          full_name: fullName,
          currency: '₹',
        };
        setUser(localUser);
        setProfile(localProfile);
        setIsDemo(true);
        localStorage.setItem(
          'expense-tracker-local-session',
          JSON.stringify({ user: localUser, profile: localProfile, isDemo: true })
        );
        return { user: localUser };
      }
      throw err;
    }
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const localUser = {
        id: 'local-user',
        email,
        user_metadata: { full_name: email.split('@')[0] },
      };
      const localProfile = {
        id: 'local-user',
        full_name: email.split('@')[0],
        currency: '₹',
      };
      setUser(localUser);
      setProfile(localProfile);
      setIsDemo(true);
      localStorage.setItem(
        'expense-tracker-local-session',
        JSON.stringify({ user: localUser, profile: localProfile, isDemo: true })
      );
      return { user: localUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.user) {
        localStorage.removeItem('expense-tracker-local-session');
        setUser(data.user);
        setIsDemo(false);
        await fetchProfile(data.user.id);
      }
      return data;
    } catch (err) {
      if (err.message?.includes('fetch') || err.message?.includes('API key') || err.status === 400) {
        const localUser = {
          id: 'local-user',
          email,
          user_metadata: { full_name: email.split('@')[0] },
        };
        const localProfile = {
          id: 'local-user',
          full_name: email.split('@')[0],
          currency: '₹',
        };
        setUser(localUser);
        setProfile(localProfile);
        setIsDemo(true);
        localStorage.setItem(
          'expense-tracker-local-session',
          JSON.stringify({ user: localUser, profile: localProfile, isDemo: true })
        );
        return { user: localUser };
      }
      throw err;
    }
  };

  const enableDemoMode = () => {
    const localUser = {
      id: 'guest',
      email: 'guest@local',
      user_metadata: { full_name: 'Guest User' },
    };
    const localProfile = {
      id: 'guest',
      full_name: 'Guest User',
      currency: '₹',
    };
    setUser(localUser);
    setProfile(localProfile);
    setIsDemo(true);
    localStorage.setItem(
      'expense-tracker-local-session',
      JSON.stringify({ user: localUser, profile: localProfile, isDemo: true })
    );
  };

  const signOut = async () => {
    if (isSupabaseConfigured && !isDemo) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem('expense-tracker-local-session');
    // Clear local data so a fresh start happens next time
    localStorage.removeItem('expense_iq_transactions');
    localStorage.removeItem('expense_iq_budgets');
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  };

  const updateProfile = async (updates) => {
    setProfile((prev) => {
      const nextProfile = { ...prev, ...updates };
      if (!isSupabaseConfigured || isDemo) {
        const saved = localStorage.getItem('expense-tracker-local-session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            localStorage.setItem(
              'expense-tracker-local-session',
              JSON.stringify({ ...parsed, profile: nextProfile })
            );
          } catch {
            // Ignore malformed session, state update still applies
          }
        }
      }
      return nextProfile;
    });
    if (isSupabaseConfigured && !isDemo && user) {
      const { data } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (data) setProfile(data);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isDemo,
    isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    enableDemoMode, // Used as 'continue as guest'
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
