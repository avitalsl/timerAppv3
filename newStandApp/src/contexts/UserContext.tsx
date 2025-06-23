import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { USER_TYPES } from '../types/userTypes';
import type { AppUser, UserType } from '../types/userTypes';

// Define the context interface
interface UserContextType {
  currentUser: AppUser | null;
  addViewOnlyUser: (name: string) => void;
  isInteractiveUser: (userId?: string) => boolean;
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  currentUser: null,
  addViewOnlyUser: () => {},
  isInteractiveUser: () => false,
});

// Provider component that wraps the application
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  
  // Convert Firebase User to AppUser
  const createAppUserFromFirebase = (firebaseUser: User | null): AppUser | null => {
    if (!firebaseUser) return null;
    
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || undefined,
      avatarUrl: firebaseUser.photoURL || undefined,
      type: 'interactive' as UserType,
      isAuthenticated: true
    };
  };
  
  // Add a view-only user (manually added, not authenticated)
  const addViewOnlyUser = (name: string) => {
    const viewOnlyUser: AppUser = {
      id: `viewonly-${Date.now()}`,
      name,
      type: 'viewOnly',
      isAuthenticated: false
    };
    
    setCurrentUser(viewOnlyUser);
  };
  
  // Check if a user is interactive (has full permissions)
  const isInteractiveUser = (userId?: string): boolean => {
    if (!currentUser) return false;
    if (userId && userId !== currentUser.id) return false;
    return currentUser.type === 'interactive';
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(createAppUserFromFirebase(firebaseUser));
    });
    return unsubscribe;
  }, []);
  
  const contextValue = {
    currentUser,
    addViewOnlyUser,
    isInteractiveUser
  };

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

// Hook for easy access to the user context from other components
export const useUserContext = () => useContext(UserContext);

// Convenience hook to get just the current user
export const useCurrentUser = () => useContext(UserContext).currentUser;