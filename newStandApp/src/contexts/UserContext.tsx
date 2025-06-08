import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

// 1. יצירת הקונטקסט
const UserContext = createContext<User | null>(null);

// 2. ה-Provider שעוטף את האפליקציה
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

// 3. קריאה נוחה מתוך קומפוננטות אחרות
export const useCurrentUser = () => useContext(UserContext);