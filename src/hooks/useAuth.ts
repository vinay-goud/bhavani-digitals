
'use client';

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { createUserProfile, getUserRole, UserRole } from '@/services/dataService';

import { browserLocalPersistence } from 'firebase/auth';

export const useAuth = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Enable persistent storage
    auth.setPersistence(browserLocalPersistence);

    // Check if we have a session stored
    const lastSession = localStorage.getItem('lastSession');
    if (lastSession) {
      const sessionData = JSON.parse(lastSession);
      const now = new Date().getTime();
      // If the session is less than 24 hours old, use it
      if (now - sessionData.timestamp < 24 * 60 * 60 * 1000) {
        setUser(sessionData.user);
        setRole(sessionData.role || 'user');
        setIsLoading(false);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch role from Firestore
        const userRole = await getUserRole(user.uid);
        setRole(userRole);
        // Store the session with role
        localStorage.setItem('lastSession', JSON.stringify({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          role: userRole,
          timestamp: new Date().getTime()
        }));
      } else {
        setRole(null);
        localStorage.removeItem('lastSession');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Redirects user based on their role after successful authentication.
   */
  const redirectBasedOnRole = async (uid: string) => {
    const userRole = await getUserRole(uid);
    setRole(userRole);
    if (userRole === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleSignIn = async (provider: 'google' | 'credentials', data?: any) => {
    setIsLoading(true);
    try {
      let userCredential;
      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(auth, googleProvider);
        // Check if this is a new Google user (no profile yet)
        const existingRole = await getUserRole(userCredential.user.uid);
        if (!existingRole || existingRole === 'user') {
          // Create profile for new Google users if it doesn't exist
          await createUserProfile({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
          });
        }
      } else if (provider === 'credentials' && data) {
        userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      }

      if (userCredential) {
        toast({ title: 'Logged in successfully!' });
        await redirectBasedOnRole(userCredential.user.uid);
      }
    } catch (error: any) {
      console.error("Sign in error", error);
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: any) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

      // Create user profile in Firestore with default 'user' role
      await createUserProfile({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: data.name || null,
        photoURL: null,
      });

      const actionCodeSettings = {
        url: window.location.origin + '/auth', // Redirect back to login page after verification
        handleCodeInApp: true
      };
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.'
      });
      // Redirect to dashboard for new users
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error("Sign up error", error);
      toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setRole(null);
      localStorage.removeItem('lastSession');
      toast({ title: 'Logged out successfully.' })
      window.location.href = '/';
    } catch (error: any) {
      console.error("Sign out error", error);
      toast({ title: 'Logout Failed', description: error.message, variant: 'destructive' });
    }
  }

  const handleResetPassword = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      toast({ title: 'Reset email sent!', description: 'Check your email for password reset instructions.' });
    } catch (error: any) {
      console.error("Password reset error", error);
      toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    role,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword
  };
};

export const useIsLoggedIn = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userRole = await getUserRole(user.uid);
        setRole(userRole);
      } else {
        setRole(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { isLoggedIn, role, isLoading };
}
