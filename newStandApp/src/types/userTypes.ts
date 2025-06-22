/**
 * User type definitions for the application
 * Defines the available user types and interfaces for user data
 */

// Define user types as a const array (not using TypeScript enums)
export const USER_TYPES = ['interactive', 'viewOnly'] as const;

// Create a type from the array values
export type UserType = typeof USER_TYPES[number];

/**
 * Interface representing a user in the application
 */
export interface AppUser {
  /**
   * Unique identifier for the user
   */
  id: string;
  
  /**
   * Display name for the user
   */
  name: string;
  
  /**
   * User's role/type which determines their permissions
   * - interactive: authenticated users who can perform actions
   * - viewOnly: users who can only view content
   */
  type: UserType;
  
  /**
   * Optional email address (typically available for interactive users)
   */
  email?: string;
  
  /**
   * Optional profile image URL
   */
  avatarUrl?: string;
  
  /**
   * Whether the user is authenticated via Google
   * Interactive users are always authenticated
   */
  isAuthenticated: boolean;
}
