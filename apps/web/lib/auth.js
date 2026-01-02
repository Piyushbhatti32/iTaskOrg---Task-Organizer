import { adminAuth } from '../config/firebase-admin.js';

/**
 * Verifies a Firebase authentication token
 * @param {string} token - The Firebase ID token to verify
 * @returns {Promise<Object>} - The decoded token payload
 * @throws {Error} - If token is invalid or verification fails
 */
export async function verifyAuthToken(token) {
  if (!token) {
    throw new Error('No authentication token provided');
  }

  if (!adminAuth) {
    throw new Error('Firebase Admin Auth not initialized');
  }

  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    // Verify the token using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(cleanToken);
    
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Middleware function to extract and verify auth token from request headers
 * @param {Object} req - The request object (Next.js Request in app router)
 * @returns {Promise<Object>} - The decoded token payload
 * @throws {Error} - If token is missing or invalid
 */
export async function getAuthenticatedUser(req) {
  // Handle both Next.js app router (Request object) and traditional req objects
  const authHeader = req.headers.get 
    ? req.headers.get('authorization')  // Next.js app router
    : req.headers.authorization;         // Traditional Node.js req
  
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  
  return await verifyAuthToken(token);
}
