import userData from '@/database/users.json';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

// In-memory "database"
let user: UserProfile = userData[0];

// Function to get the current user data
export const getUser = (): UserProfile => {
  return user;
};

// Function to update the user data
export const updateUser = (newUser: UserProfile) => {
  user = newUser;
};
