import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../config/firebase-admin';

export async function POST(request) {
  try {
    const { email, uid } = await request.json();
    
    // Check if this is an admin/support account
    const adminEmails = ['admin@itaskorg.com', 'support@itaskorg.com'];
    
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
