import { adminAuth } from '../config/firebase-admin';
import { getAdminEmails } from './roles';

/**
 * Verify admin access for API routes
 * @param {Request} request - The incoming request object
 * @returns {Promise<Object>} - Returns { authorized: boolean, user: Object|null, error: string|null }
 */
export async function verifyAdminAccess(request) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        authorized: false,
        user: null,
        error: 'Missing or invalid authorization header'
      };
    }

    // Extract and verify token
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        authorized: false,
        user: null,
        error: 'Invalid or expired token'
      };
    }

    // Check if user email is in admin list
    const adminEmails = getAdminEmails();
    const userEmail = decodedToken.email?.toLowerCase();
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      console.warn(`Unauthorized admin access attempt by: ${userEmail}`);
      return {
        authorized: false,
        user: decodedToken,
        error: 'Admin access required'
      };
    }

    console.log(`✅ Admin access verified for: ${userEmail}`);
    return {
      authorized: true,
      user: decodedToken,
      error: null
    };

  } catch (error) {
    console.error('Error during admin verification:', error);
    return {
      authorized: false,
      user: null,
      error: 'Internal server error during authentication'
    };
  }
}

/**
 * Create a standardized error response for unauthorized access
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 403)
 * @returns {Response} - Next.js Response object
 */
export function createUnauthorizedResponse(message = 'Unauthorized', status = 403) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Middleware wrapper for admin-only API routes
 * @param {Function} handler - The actual API route handler
 * @returns {Function} - Wrapped handler with admin verification
 */
export function withAdminAuth(handler) {
  return async (request, context) => {
    const verification = await verifyAdminAccess(request);
    
    if (!verification.authorized) {
      const status = verification.error === 'Missing or invalid authorization header' || 
                     verification.error === 'Invalid or expired token' ? 401 : 403;
      return createUnauthorizedResponse(verification.error, status);
    }

    // Add user info to the request context for use in the handler
    request.adminUser = verification.user;
    
    return handler(request, context);
  };
}
