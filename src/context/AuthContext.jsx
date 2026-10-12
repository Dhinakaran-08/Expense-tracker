import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);
const LOCAL_SESSION_KEY = 'expense-tracker-local-session';
const LOCAL_USERS_KEY = 'expense-tracker-local-users';

// Helper to check if an error is a low-level network failure (e.g. ad-blocker, offline, DNS drop)
const isNetworkOrFetchError = (err) => {
  if (!err) return false;
  // If Supabase returned an HTTP status (e.g. 400 invalid credentials, 422, etc.), it is NOT a network failure
  if (err.status && err.status >= 400 && err.status < 500) {
    return false;
  }
  const msg = (err.message || '').toLowerCase();
  return (
    err.name === 'TypeError' ||
    msg.includes('failed to fetch') ||
    msg.includes('fetch failed') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('err_blocked_by_client')
  );
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchProfile = async (userId, userMetadata = {}) => {
    if (!isSupabaseConfigured || !userId) return;
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // If the trigger hasn't populated a profile row yet, auto-upsert a default one
      if (!data && !error) {
        const initialProfile = {
          id: userId,
          full_name: userMetadata?.full_name || '',
          currency: '₹',
        };
        const { data: inserted } = await supabase
          .from('profiles')
          .upsert(initialProfile)
          .select()
          .maybeSingle();
        data = inserted || initialProfile;
      }

      if (data) setProfile(data);
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  };

  useEffect(() => {
    const savedSession = localStorage.getItem(LOCAL_SESSION_KEY);
    let savedLocal = null;
    if (savedSession) {
      try {
        savedLocal = JSON.parse(savedSession);
      } catch {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    }

    if (!isSupabaseConfigured) {
      // Offline / Local Mode: Only load saved local session if present
      if (savedLocal) {
        setUser(savedLocal.user);
        setProfile(savedLocal.profile);
        setIsDemo(Boolean(savedLocal.isDemo));
      }
      setLoading(false);
      return;
    }

    // Supabase Mode
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsDemo(false);
        fetchProfile(session.user.id, session.user.user_metadata);
      } else if (savedLocal?.isDemo) {
        // Only honor guest mode if specifically clicked "continue as guest"
        setUser(savedLocal.user);
        setProfile(savedLocal.profile);
        setIsDemo(true);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setIsDemo(false);
          localStorage.removeItem(LOCAL_SESSION_KEY);
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.user_metadata);
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(LOCAL_SESSION_KEY);
          setUser(null);
          setProfile(null);
          setIsDemo(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Helper to register a local user account (offline/fallback mode)
  const registerLocalUser = (cleanEmail, password, fullName) => {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    } catch {
      users = [];
    }

    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const localUser = {
      id: 'local-' + Date.now(),
      email: cleanEmail,
      password, // Saved in localStorage to verify on subsequent logins
      user_metadata: { full_name: fullName },
    };
    const localProfile = {
      id: localUser.id,
      full_name: fullName,
      currency: '₹',
    };

    users.push(localUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

    setUser(localUser);
    setProfile(localProfile);
    setIsDemo(true);
    localStorage.setItem(
      LOCAL_SESSION_KEY,
      JSON.stringify({ user: localUser, profile: localProfile, isDemo: true })
    );
    return { user: localUser, isLocal: true };
  };

  // Helper to authenticate a local user account (offline/fallback mode)
  const loginLocalUser = (cleanEmail, password) => {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    } catch {
      users = [];
    }

    const existingUser = users.find((u) => u.email === cleanEmail);
    if (!existingUser) {
      throw new Error('No account found with this email. Please create an account first.');
    }

    if (existingUser.password !== password) {
      throw new Error('Invalid email or password.');
    }

    const localProfile = {
      id: existingUser.id,
      full_name: existingUser.user_metadata?.full_name || cleanEmail.split('@')[0],
      currency: '₹',
    };

    setUser(existingUser);
    setProfile(localProfile);
    setIsDemo(true);
    localStorage.setItem(
      LOCAL_SESSION_KEY,
      JSON.stringify({ user: existingUser, profile: localProfile, isDemo: true })
    );
    return { user: existingUser, isLocal: true };
  };

  const signUp = async (email, password, fullName) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      return registerLocalUser(cleanEmail, password, fullName);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        localStorage.removeItem(LOCAL_SESSION_KEY);
        setUser(data.user);
        setIsDemo(false);
        await fetchProfile(data.user.id, { full_name: fullName });
      }

      return data;
    } catch (err) {
      // If it is a real network/ad-blocker failure ('Failed to fetch'):
      // Register in local verified mode so the user isn't stuck.
      if (isNetworkOrFetchError(err)) {
        console.warn('Supabase cloud unreachable (Failed to fetch). Registering account in local mode:', err);
        return registerLocalUser(cleanEmail, password, fullName);
      }
      // Otherwise (duplicate email, weak password, etc.), throw the actual error!
      throw err;
    }
  };

  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      return loginLocalUser(cleanEmail, password);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        localStorage.removeItem(LOCAL_SESSION_KEY);
        setUser(data.user);
        setIsDemo(false);
        await fetchProfile(data.user.id, data.user.user_metadata);
      }

      return data;
    } catch (err) {
      // If it is a real network/ad-blocker failure:
      // Try to verify against local registered users
      if (isNetworkOrFetchError(err)) {
        console.warn('Supabase cloud unreachable. Attempting login via local mode:', err);
        return loginLocalUser(cleanEmail, password);
      }
      // If it is an auth error (wrong password, account not found), throw it!
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
      LOCAL_SESSION_KEY,
      JSON.stringify({ user: localUser, profile: localProfile, isDemo: true })
    );
  };

  const signOut = async () => {
    if (isSupabaseConfigured && !isDemo) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    setProfile(null);
    setIsDemo(false);
  };

  const updateProfile = async (updates) => {
    setProfile((prev) => {
      const nextProfile = { ...prev, ...updates };
      if (!isSupabaseConfigured || isDemo) {
        const saved = localStorage.getItem(LOCAL_SESSION_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            localStorage.setItem(
              LOCAL_SESSION_KEY,
              JSON.stringify({ ...parsed, profile: nextProfile })
            );
          } catch {
            // Ignore malformed session
          }
        }
      }
      return nextProfile;
    });

    if (isSupabaseConfigured && !isDemo && user) {
      const { data } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates })
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
    enableDemoMode,
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
