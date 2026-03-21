'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import {
  FacebookAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const syncUserWithBackend = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to sync user with backend.';
      try {
        const payload = await response.json();
        errorMessage = payload.error || payload.details || errorMessage;
      } catch (_) {
        // Ignore JSON parsing errors and keep fallback message.
      }
      throw new Error(errorMessage);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserWithBackend(credential.user);
      router.push('/');
    } catch (err) {
      setError(err?.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    const result = await loginWithGoogle();
    
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Google sign in failed.');
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const facebookProvider = new FacebookAuthProvider();
      const credential = await signInWithPopup(auth, facebookProvider);
      await syncUserWithBackend(credential.user);
      router.push('/');
    } catch (err) {
      setError(err?.message || 'Facebook sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-orange-100 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Sign in with Firebase</p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 text-white py-2.5 font-medium hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in with email'}
          </button>
        </form>

        <div className="my-4 text-center text-sm text-gray-400">or</div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-lg border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Continue with Google
        </button>
        <button
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full mt-3 rounded-lg border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Continue with Facebook
        </button>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 break-words">{error}</p>
        ) : null}

        <p className="mt-5 text-sm text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link className="text-orange-600 hover:text-orange-700 font-medium" href="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
