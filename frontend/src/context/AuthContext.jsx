import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from './firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set auth header helper
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Sync session on token change or startup
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        setAuthHeader(token);
        try {
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await axios.get(`${backendUrl}/auth/me`);
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profiles:', error);
          // Only force logout if the error is 401 Unauthorized
          if (error.response && error.response.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Keep Firebase Auth State Synced in background
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken(true); // force refresh
          localStorage.setItem('token', idToken);
          setToken(idToken);
          setAuthHeader(idToken);
        } catch (err) {
          console.error('Error refreshing token:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const loginWithProvider = async (provider) => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      localStorage.setItem('token', idToken);
      setToken(idToken);
      setAuthHeader(idToken);

      // Fetch profile from backend (which auto-creates the user in MongoDB if needed)
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${backendUrl}/auth/me`);
      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      console.error('Provider sign-in failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = () => loginWithProvider(googleProvider);
  const loginWithGithub = () => loginWithProvider(githubProvider);

  const loginEmail = async (email, password) => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${backendUrl}/auth/login`, {
        username: email,
        password: password,
      });

      const { access_token, user: userDetails } = response.data;

      localStorage.setItem('token', access_token);
      setToken(access_token);
      setAuthHeader(access_token);
      setUser(userDetails);
      setLoading(false);
      return userDetails;
    } catch (error) {
      setLoading(false);
      console.error('Email sign-in failed:', error);
      throw error;
    }
  };

  const registerEmail = async (email, password, name) => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      // 1. Call Register
      await axios.post(`${backendUrl}/auth/register`, {
        name,
        email,
        password,
      });

      // 2. Call Login
      const loginResponse = await axios.post(`${backendUrl}/auth/login`, {
        username: email,
        password: password,
      });

      const { access_token, user: userDetails } = loginResponse.data;

      localStorage.setItem('token', access_token);
      setToken(access_token);
      setAuthHeader(access_token);
      setUser(userDetails);
      setLoading(false);
      return userDetails;
    } catch (error) {
      setLoading(false);
      console.error('Email registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase signout failed:', err);
    }
  };

  const updateProfile = (updatedUser) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    loginWithGoogle,
    loginWithGithub,
    loginEmail,
    registerEmail,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
