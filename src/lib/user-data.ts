export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

// Mock user data stored in localStorage or a simple variable
let mockUser: UserProfile = {
  name: 'Pengguna',
  email: 'pengguna@example.com',
  phone: '081234567890',
  avatar: 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjQxNDg4ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
};

// Function to get the current user data
export const getUser = (): UserProfile => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('userProfile');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
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
