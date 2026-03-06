'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await firebaseUser.getIdToken(true);
        localStorage.setItem('token', token); // Legacy sync

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          localStorage.setItem('role', data.role || 'customer');
        } else {
          console.warn('Backend profile sync failed, using Firebase profile as fallback');
          const fallbackUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'customer',
            profile_img: firebaseUser.photoURL || ''
          };
          setUser(fallbackUser);
          localStorage.setItem('role', 'customer');
        }
      } catch (error) {
        console.error('Error syncing user with backend:', error);
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: 'customer',
          profile_img: firebaseUser.photoURL || ''
        });
        localStorage.setItem('role', 'customer');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => prev ? { ...prev, ...updatedData } : null);
  };

  const getToken = async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        getToken,
        updateUser,
        loginWithGoogle,
        isAuthenticated: !!user,
        login: async () => ({ success: false, error: 'Standard login not implemented in provider' }),
        register: async () => ({ success: false, error: 'Standard register not implemented in provider' }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
