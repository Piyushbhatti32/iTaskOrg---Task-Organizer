import { NextResponse } from 'next/server';
import { adminDb } from '../../../config/firebase-admin';
import { verifyAuthToken } from '../../../lib/auth';

export async function GET(request) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    // Get userId from query parameters (same pattern as tasks)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), { status: 400 });
    }

    console.log('Fetching templates for user:', userId);

    const templatesRef = adminDb.collection('templates');
    const snapshot = await templatesRef
      .where('userId', '==', userId)
      .get();

    const templates = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }))
      // Sort by createdAt in descending order (newest first)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

    console.log('Found', templates.length, 'templates for user:', userId);

    return new Response(JSON.stringify({ templates }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return new Response(JSON.stringify({ 
      error: 'Error fetching templates',
      details: error.message 
    }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const templateData = await request.json();
    const { userId, ...rest } = templateData;

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'User ID is required' 
      }), { status: 400 });
    }

    if (!templateData.name?.trim()) {
      return new Response(JSON.stringify({ 
        error: 'Template name is required' 
      }), { status: 400 });
    }

    console.log('Creating template for user:', userId);

    // Generate a unique template ID
    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newTemplate = {
      id: templateId,
      name: templateData.name.trim(),
      description: templateData.description || '',
      taskTitle: templateData.taskTitle || '',
      priority: templateData.priority || 'medium',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore using Admin SDK
    const templateRef = adminDb.collection('templates').doc(templateId);
    await templateRef.set({
      ...newTemplate,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Template created successfully:', templateId);

    return new Response(JSON.stringify({
      message: 'Template created successfully',
      template: newTemplate,
      success: true
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return new Response(JSON.stringify({ 
      error: 'Error creating template',
      details: error.message,
      success: false
    }), { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    const templateData = await request.json();
    const { id: templateId, ...updateData } = templateData;

    if (!templateId) {
      return new Response(JSON.stringify({ 
        error: 'Template ID is required' 
      }), { status: 400 });
    }

    console.log('Updating template:', templateId);

    // Update template in Firestore using Admin SDK
    const templateRef = adminDb.collection('templates').doc(templateId);
    
    // Check if template exists
    const templateDoc = await templateRef.get();
    if (!templateDoc.exists) {
      return new Response(JSON.stringify({ 
        error: 'Template not found' 
      }), { status: 404 });
    }

    // Update the template
    const updatedData = {
      ...updateData,
      updatedAt: new Date()
    };

    await templateRef.update(updatedData);

    console.log('Template updated successfully:', templateId);

    // Get the updated template data
    const updatedTemplateDoc = await templateRef.get();
    const updatedTemplateData = {
      id: templateId,
      ...updatedTemplateDoc.data(),
      createdAt: updatedTemplateDoc.data().createdAt?.toDate?.()?.toISOString() || updatedTemplateDoc.data().createdAt,
      updatedAt: updatedTemplateDoc.data().updatedAt?.toDate?.()?.toISOString() || updatedTemplateDoc.data().updatedAt
    };

    return new Response(JSON.stringify({
      message: 'Template updated successfully',
      template: updatedTemplateData,
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return new Response(JSON.stringify({ 
      error: 'Error updating template',
      details: error.message,
      success: false
    }), { status: 500 });
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

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Verify the template belongs to the user
    const templateRef = adminDb.collection('templates').doc(templateId);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (templateDoc.data().userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this template' }, { status: 403 });
    }

    await templateRef.delete();

    return NextResponse.json({ success: true, id: templateId });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
