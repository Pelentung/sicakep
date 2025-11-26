import userData from '@/database/user.json';

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

// Mock user data stored in localStorage or a simple variable
let mockUser: UserProfile = userData;

// Function to get the current user data
export const getUser = (): UserProfile => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('userProfile');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    // If no user in local storage, set it from the initial file
    localStorage.setItem('userProfile', JSON.stringify(mockUser));
  }
  return mockUser;
};

// Function to update the user data
export const updateUser = (newUser: UserProfile) => {
  mockUser = { ...mockUser, ...newUser };
   if (typeof window !== 'undefined') {
    localStorage.setItem('userProfile', JSON.stringify(mockUser));
    
    // This is a bit of a hack to trigger a re-render in the header
    // In a real app, this would be handled by a global state manager (like Redux, Zustand, or Context)
    window.dispatchEvent(new Event('storage'));
  }
  return mockUser;
};
