import { adminAuth } from '../config/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';

/**
 * Verifies a Firebase authentication token
 * @param token - The Firebase ID token to verify
 * @returns The decoded token payload
 * @throws Error if token is invalid or verification fails
 */
export async function verifyAuthToken(token: string): Promise<DecodedIdToken> {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Token verification failed:', errorMessage);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Traditional request object with headers (for backwards compatibility)
 */
interface TraditionalRequest {
  headers: {
    authorization?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Middleware function to extract and verify auth token from request headers
 * @param req - The request object (Next.js Request in app router or traditional req)
 * @returns The decoded token payload
 * @throws Error if token is missing or invalid
 */
export async function getAuthenticatedUser(
  req: NextRequest | TraditionalRequest
): Promise<DecodedIdToken> {
  // Handle both Next.js app router (Request object) and traditional req objects
  const authHeader = typeof req.headers.get === 'function'
    ? req.headers.get('authorization')  // Next.js app router
    : (req.headers as Record<string, string | undefined>).authorization;  // Traditional Node.js req
  
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  
  return await verifyAuthToken(token);
}