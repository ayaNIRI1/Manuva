'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken, signOut } = useClerkAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocalUser = async () => {
      if (!clerkLoaded) return;
      
      if (!clerkUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Fallback while webhook creates the user in the backend
          setUser({
            id: clerkUser.id,
            name: clerkUser.fullName || 'User',
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            role: 'customer',
            profile_img: clerkUser.imageUrl
          });
        }
      } catch (error) {
        console.error('Error fetching local user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalUser();
  }, [clerkUser, clerkLoaded, getToken]);

  const logout = () => {
    signOut();
  };

  const updateUser = (updatedData) => {
    setUser({ ...user, ...updatedData });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || !clerkLoaded,
        logout,
        getToken,
        updateUser,
        isAuthenticated: !!user,
        login: async () => ({ success: false, error: 'Use Clerk for login' }),
        register: async () => ({ success: false, error: 'Use Clerk for register' }),
        loginWithGoogle: async () => ({ success: false, error: 'Use Clerk for Google auth' }),
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
