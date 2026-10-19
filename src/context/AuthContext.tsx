/**
 * @file AuthContext.tsx
 * @description React Authentication context wrapping Firebase Auth with Google Sign-In and in-memory JWT tokens.
 * @author s-reinmar
 * @license MIT
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

export interface AuthContextType {
  readonly user: User | null;
  readonly idToken: string | null;
  readonly isLoading: boolean;
  readonly signInWithGoogle: () => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly getFreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);
        } catch (tokenError) {
          console.error('[AuthContext] Nie udało się pobrać ID tokenu:', tokenError);
          setIdToken(null);
        }
      } else {
        setIdToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const token = await cred.user.getIdToken();
      setUser(cred.user);
      setIdToken(token);
    } catch (error) {
      console.error('[AuthContext] Błąd logowania przez Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIdToken(null);
    } catch (error) {
      console.error('[AuthContext] Błąd wylogowywania:', error);
      throw error;
    }
  };

  const getFreshToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      const fresh = await auth.currentUser.getIdToken(true);
      setIdToken(fresh);
      return fresh;
    } catch (err) {
      console.error('[AuthContext] Błąd odświeżania tokenu:', err);
      return idToken;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        isLoading,
        signInWithGoogle,
        logout,
        getFreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
