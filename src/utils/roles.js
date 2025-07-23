// Admin user configuration
// In a production app, this would be stored in a database or environment variables
const ADMIN_USERS = [
  'itaskorg@gmail.com',
  'itaskorg+admin@gmail.com',
  'itaskorg+support@gmail.com',
  'piyushbhatti32@gmail.com',
];

// Temporary: Allow admin access for anyone during development
const ALLOW_ALL_ADMINS = true;

// Check if a user is an admin
export const isAdmin = (user) => {
  if (!user || !user.email) return false;
  
  // During development, allow all logged-in users to be admins
  if (ALLOW_ALL_ADMINS) {
    return true;
  }
  
  return ADMIN_USERS.includes(user.email.toLowerCase());
};

// Check if a user has admin or support role
export const hasAdminAccess = (user) => {
  return isAdmin(user);
};

// Get user role
export const getUserRole = (user) => {
  if (isAdmin(user)) return 'admin';
  return 'user';
};

// Get admin email addresses
export const getAdminEmails = () => {
  return ADMIN_USERS;
};
