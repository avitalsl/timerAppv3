import React, { useState } from 'react';
import { type User } from 'firebase/auth';
import { signOut } from 'firebase/auth'; // For signOut
import { auth, signInWithGoogle } from '../firebase'; // For auth and signInWithGoogle

interface UserAvatarProps {
  user: User | null;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const [showLogout, setShowLogout] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.map(part => part.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  return (
    <div
      className="relative inline-flex flex-col items-end"
      onMouseEnter={() => setShowLogout(true)}
      onMouseLeave={() => setShowLogout(false)}
    >
      {/* Avatar circle - direct child of the relative container */}
      <div
        className="flex items-center justify-center w-10 h-10 bg-primary-dark rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-green-600 transition-all duration-150 ease-in-out"
        title={user?.displayName || user?.email || 'User'}
      >
        {/* Always display initials, photoURL logic is removed */}
        <span className="text-lg text-white">
          {getInitials(user?.displayName || user?.email || '')}
        </span>
      </div>

      {/* Login/Logout Button - absolutely positioned relative to the main div */}
      {showLogout && (
        <button
          onClick={user ? () => signOut(auth) : signInWithGoogle}
          className="absolute top-full right-0 bg-white border text-sm text-gray-700 px-3 py-1 rounded shadow-md hover:bg-gray-100 z-20 transition-opacity duration-200 ease-in-out"
        >
          {user ? 'Logout' : 'Login'}
        </button>
      )}
    </div>
  );
};

export default UserAvatar;