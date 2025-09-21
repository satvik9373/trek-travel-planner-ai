import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  TwitterAuthProvider,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: {
    favoriteDestinations: string[];
    travelStyle: 'budget' | 'mid-range' | 'luxury';
    interests: string[];
    dietaryRestrictions: string[];
    accessibility: string[];
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      weather: boolean;
      deals: boolean;
    };
  };
  createdAt: Date;
  lastLogin: Date;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false to not block UI initially

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserProfile(user.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setUserProfile(data);
        
        // Update last login
        await updateDoc(doc(db, 'users', uid), {
          lastLogin: new Date()
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const createUserProfile = async (user: User, additionalData: any = {}) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || additionalData.displayName || '',
        photoURL: user.photoURL,
        preferences: {
          favoriteDestinations: [],
          travelStyle: 'mid-range',
          interests: [],
          dietaryRestrictions: [],
          accessibility: [],
          language: 'en',
          currency: 'INR',
          notifications: {
            email: true,
            push: true,
            weather: true,
            deals: false
          }
        },
        createdAt: new Date(),
        lastLogin: new Date(),
        emailVerified: user.emailVerified,
        ...additionalData
      };

      await setDoc(userRef, newProfile);
      setUserProfile(newProfile);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile
      await createUserProfile(result.user, { displayName });
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      toast.success('Account created! Please check your email for verification.');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      toast.success('Successfully logged out!');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updates });
      }
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  };

  const updateUserEmail = async (newEmail: string, currentPassword: string) => {
    if (!user || !user.email) throw new Error('No user logged in');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      // Update profile in Firestore
      await updateUserProfile({ email: newEmail });
      
      toast.success('Email updated successfully!');
    } catch (error: any) {
      console.error('Email update error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('No user logged in');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      toast.success('Password updated successfully!');
    } catch (error: any) {
      console.error('Password update error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      toast.success('Successfully logged in with Google!');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    try {
      setLoading(true);
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      toast.success('Successfully logged in with Facebook!');
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithTwitter = async () => {
    try {
      setLoading(true);
      const provider = new TwitterAuthProvider();
      
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      toast.success('Successfully logged in with Twitter!');
    } catch (error: any) {
      console.error('Twitter sign-in error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    if (!user) throw new Error('No user logged in');

    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent!');
    } catch (error: any) {
      console.error('Verification email error:', error);
      throw new Error('Failed to send verification email');
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Invalid password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/requires-recent-login':
        return 'Please log in again to perform this action.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    sendVerificationEmail,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};