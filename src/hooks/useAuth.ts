
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

export const useAuth = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (provider: 'google' | 'credentials', data?: any) => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);
        toast({ title: 'Logged in successfully!' });
        window.location.href = '/admin';
      } else if (provider === 'credentials' && data) {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          await signOut(auth);
          toast({ 
            title: 'Email not verified', 
            description: 'Please check your email for verification link. A new verification email has been sent.' 
          });
          return;
        }
        toast({ title: 'Logged in successfully!' });
        window.location.href = '/admin';
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
      await sendEmailVerification(userCredential.user);
      toast({ 
        title: 'Account created!', 
        description: 'Please check your email to verify your account.' 
      });
      window.location.href = '/auth';
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
        toast({ title: 'Logged out successfully.'})
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
    isLoading, 
    signIn: handleSignIn, 
    signUp: handleSignUp, 
    signOut: handleSignOut,
    resetPassword: handleResetPassword 
  };
};

export const useIsLoggedIn = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { isLoggedIn, isLoading };
}
