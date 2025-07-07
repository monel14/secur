import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { User } from '@/types';
import { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, retries = 3): Promise<void> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, agency_id, avatar_seed, email, name, role, solde, status, suspension_reason')
        .eq('id', userId)
        .single();

      if (error && error.details?.includes("0 rows")) {
        if (retries > 0) {
          console.log(`Profile not found for ${userId}, retrying... (${retries} left)`);
          await new Promise(res => setTimeout(res, 1000));
          return fetchUserProfile(userId, retries - 1);
        } else {
          console.error("Error fetching profile after retries:", error);
          alert("Votre compte a été créé, mais nous n'avons pas pu charger votre profil. Veuillez réessayer de vous connecter ou contacter le support.");
          await supabase.auth.signOut();
          setCurrentUser(null);
          return;
        }
      } else if (error) {
        console.error("Error fetching profile:", error);
        alert("Une erreur est survenue lors du chargement de votre profil. Veuillez réessayer.");
        setCurrentUser(null);
        return;
      }
      
      if (profile) {
        setCurrentUser(profile as unknown as User);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setCurrentUser(null);
    }
  };

  const handleLogin = async (email: string, password_not_used: string, role: User['role']) => {
    const password = 'password';
    setLoading(true);
    
    try {
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role
            }
          }
        });
        
        if (signUpError) {
          alert(`Erreur d'inscription: ${signUpError.message}`);
          setLoading(false);
        }
      } else if (signInError) {
        alert(`Erreur de connexion: ${signInError.message}`);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Une erreur est survenue lors de la connexion.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setLoading(true);
        await fetchUserProfile(session.user.id);
        setLoading(false);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    currentUser,
    loading,
    handleLogin,
    handleLogout,
    fetchUserProfile
  };
};