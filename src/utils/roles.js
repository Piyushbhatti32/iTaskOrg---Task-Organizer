// Admin user configuration
// In a production app, this would be stored in a database or environment variables
const ADMIN_USERS = [
  'itaskorg@gmail.com',
  'itaskorg+admin@gmail.com',
  'itaskorg+support@gmail.com',
  'piyushbhatti32@gmail.com',
];

// Temporary: Allow admin access for anyone during development
// WARNING: Set to false in production!
const ALLOW_ALL_ADMINS = false;

// Check if a user is an admin
export const isAdmin = (user) => {
  if (!user || !user.email) return false;
  
  // During development, allow all logged-in users to be admins
  // WARNING: This should be false in production!
  if (ALLOW_ALL_ADMINS) {
    console.warn('⚠️ ALLOW_ALL_ADMINS is enabled - this should be disabled in production!');
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
