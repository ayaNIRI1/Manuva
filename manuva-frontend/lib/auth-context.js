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
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
            if (response.ok) {
              const data = await response.json();
              setUser(data);
              localStorage.setItem('role', data.role || 'customer');
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Failed to validate stored token', error);
          }
        }
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
    try {
      await firebaseSignOut(auth);
    } catch(e) {}
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



  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user?.role || 'customer');
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || data.errors?.[0]?.msg || 'Login failed' };
      }
    } catch (e) {
      return { success: false, error: 'Network error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user?.role || 'customer');
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || data.errors?.[0]?.msg || 'Registration failed' };
      }
    } catch (e) {
      return { success: false, error: 'Network error occurred. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => prev ? { ...prev, ...updatedData } : null);
  };

  const getToken = async () => {
    if (auth.currentUser) return auth.currentUser.getIdToken();
    return localStorage.getItem('token');
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
        login,
        register,
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
