import { NextResponse } from 'next/server';
import { adminDb } from '../../../config/firebase-admin';
import { verifyAuthToken } from '../../../lib/auth';

export async function GET(request) {
  try {
    // Try to get userId from query parameters first (for compatibility)
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // If no userId in query params, try Authorization header
    if (!userId) {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'User ID or Authorization token required' }, { status: 401 });
      }
      
      const decodedToken = await verifyAuthToken(token);
      userId = decodedToken.uid;
    }

    const settingsRef = adminDb.collection('settings').doc(userId);
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      // Return default settings if none exist
      const defaultSettings = {
        notifications: true,
        theme: 'light',
        autoSave: true,
        taskReminders: true,
        weekStartsOn: 'Sunday',
        timeFormat: '12',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'UTC'
      };
      return NextResponse.json({ settings: defaultSettings });
    }

    return NextResponse.json({
      settings: settingsDoc.data()
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const data = await request.json();

    const settingsRef = adminDb.collection('settings').doc(userId);
    const settingsData = {
      ...data,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await settingsRef.set(settingsData, { merge: true });

    return NextResponse.json({
      settings: settingsData
    });
  } catch (error) {
    console.error('Error creating/updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to create/update settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Try to get userId from query parameters first (for compatibility)
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    
    // If no userId in query params, try Authorization header
    if (!userId) {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'User ID or Authorization token required' }, { status: 401 });
      }
      
      const decodedToken = await verifyAuthToken(token);
      userId = decodedToken.uid;
    }

    let data;
    try {
      data = await request.json();
      console.log('Settings PUT - userId:', userId);
      console.log('Settings PUT - data:', data);
    } catch (parseError) {
      console.error('Settings PUT - JSON parse error:', parseError);
      console.error('Settings PUT - userId from URL:', userId);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const settingsRef = adminDb.collection('settings').doc(userId);
    
    // Check if settings document exists
    const settingsDoc = await settingsRef.get();
    if (settingsDoc.exists && settingsDoc.data().userId !== userId) {
      console.error('Settings PUT - Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized to update these settings' }, { status: 403 });
    }

    const updatedData = {
      ...data,
      userId,
      updatedAt: new Date()
    };
    
    console.log('Settings PUT - updating with data:', updatedData);

    await settingsRef.set(updatedData, { merge: true });
    
    console.log('Settings PUT - success');

    return NextResponse.json({
      settings: updatedData
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decodedToken = await verifyAuthToken(token);
    const userId = decodedToken.uid;

    const settingsRef = adminDb.collection('settings').doc(userId);
    const settingsDoc = await settingsRef.get();

    if (!settingsDoc.exists) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    if (settingsDoc.data().userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete these settings' }, { status: 403 });
    }

    await settingsRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting settings:', error);
    return NextResponse.json(
      { error: 'Failed to delete settings' },
      { status: 500 }
    );
  }
}
