import { NextResponse } from 'next/server';
import { adminAuth } from '@/config/firebase-admin';
import { announceNotificationCenterFeature } from '@/utils/announceNotificationCenter';

export async function POST(request) {
  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Optional: Add admin check if you want to restrict this to admin users only
      // You could check user roles here if implemented in your system
      
      console.log(`NotificationCenter announcement triggered by user: ${decodedToken.uid}`);
      
    } catch (authError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Trigger the feature announcement
    const result = await announceNotificationCenterFeature();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        details: result.details
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        details: result.details
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in NotificationCenter announcement API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for checking announcement status or getting info
export async function GET(request) {
  try {
    return NextResponse.json({
      message: 'NotificationCenter feature announcement endpoint',
      description: 'Use POST to trigger the announcement to all users',
      endpoint: '/api/announce/notification-center'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in NotificationCenter announcement GET:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
