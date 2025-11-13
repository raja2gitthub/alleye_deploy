import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { Profile, Organization, Role } from '../types';
import { Something } from "../types";

type Theme = 'light' | 'dark';

interface AuthContextType {
  session: Session | null;
  currentUser: Profile | null;
  organizations: Organization[];
  organization?: Organization; // Singular organization for non-admin roles
  loading: boolean;
  theme: Theme;
  toggleTheme: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchUserData = async (user: SupabaseAuthUser) => {
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') { // Profile doesn't exist, create it
      const userEmail = user.email!;
      const name = user.user_metadata.full_name || user.user_metadata.name || userEmail.split('@')[0];
      const company = userEmail.endsWith('@lms.com') ? 'LMS Corp' : 'Personal Account';

      const newUserProfileData: Omit<Profile, 'created_at' | 'updated_at'> = {
        id: user.id,
        name: name,
        email: userEmail,
        role: Role.USER,
        company: company,
        team: 'General',
        avatar_url: user.user_metadata.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
        points: 0,
        badges: [],
        progress: {},
      };

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(newUserProfileData)
        .select()
        .single();
      
      if (insertError) throw insertError;
      profile = newProfile;
    } else if (profileError) {
      throw profileError;
    }

    if (profile) {
      setCurrentUser(profile);
    }
  };

  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        if (session?.user) {
          await fetchUserData(session.user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        await supabase.auth.signOut().catch(console.error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
        setOrganizations([]);
        return;
    }
    
    const fetchOrgs = async () => {
        if (currentUser.role === Role.ADMIN) {
            const { data: orgs } = await supabase.from('organizations').select('*');
            setOrganizations(orgs || []);
        } else if (currentUser.organization_id) {
            const { data: org } = await supabase.from('organizations').select('*').eq('id', currentUser.organization_id).single();
            setOrganizations(org ? [org] : []);
        } else {
            setOrganizations([]);
        }
    }
    fetchOrgs();

    const orgsSubscription = supabase.channel('public:organizations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, fetchOrgs)
      .subscribe();
      
    return () => {
        supabase.removeChannel(orgsSubscription);
    }
  }, [currentUser])

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out: ", error);
      alert("An error occurred during logout. Please check your connection and try again.");
    }
  };
  
  const organization = organizations.find(org => org.id === currentUser?.organization_id);

  const value = {
    session,
    currentUser,
    organizations,
    organization,
    loading,
    theme,
    toggleTheme,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
