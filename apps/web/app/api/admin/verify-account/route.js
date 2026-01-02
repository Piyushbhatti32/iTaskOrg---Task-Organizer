import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../config/firebase-admin';

export async function POST(request) {
  try {
    // Verify authentication token first
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authentication token' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Verify that the requester is admin
    const adminEmails = ['itaskorg+admin@gmail.com', 'itaskorg+support@gmail.com'];
    if (!adminEmails.includes(decodedToken.email?.toLowerCase())) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const { email, uid } = await request.json();
    
    // Validate input
    if (!email || !uid) {
      return NextResponse.json(
        { error: 'Email and UID are required' },
        { status: 400 }
      );
    }
    
    // Check if this is an admin/support account to be verified
    if (!adminEmails.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Only admin/support accounts can be manually verified' },
        { status: 403 }
      );
    }

    // Update the user's email verification status
    await adminAuth.updateUser(uid, {
      emailVerified: true
    });

    console.log(`Manually verified admin account: ${email}`);

    return NextResponse.json(
      { 
        success: true, 
        message: `Admin account ${email} has been manually verified` 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error manually verifying admin account:', error);
    return NextResponse.json(
      { error: 'Failed to verify admin account' },
      { status: 500 }
    );
  }
}
