import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { AppUser, UserType } from '../types/userTypes';
import { participantsStorageService, authService } from '../services';

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
      // Convert Firebase user to AppUser
      const appUser = createAppUserFromFirebase(firebaseUser);
      setCurrentUser(appUser);
      
      // If user is authenticated, handle participant matching and updating
      if (appUser && appUser.email) {
        // Get current participants list
        const participants = participantsStorageService.getParticipants();
        
        // Try to find a matching participant by email
        const matchedParticipant = authService.matchParticipantByEmail(appUser.email, participants);
        
        if (matchedParticipant) {
          // Update the matched participant to be interactive
          const updatedParticipant = authService.updateParticipantFromUser(matchedParticipant, appUser);
          
          // Update the participant in the list
          const updatedParticipants = participants.map(p => 
            p.id === updatedParticipant.id ? updatedParticipant : p
          );
          
          // Save the updated list
          participantsStorageService.saveParticipants(updatedParticipants);
        } else {
          // Create a new interactive participant from the user
          const newParticipant = authService.createParticipantFromUser(appUser);
          
          // Add the new participant to the list
          const updatedParticipants = [...participants, newParticipant];
          
          // Save the updated list
          participantsStorageService.saveParticipants(updatedParticipants);
        }
      }
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