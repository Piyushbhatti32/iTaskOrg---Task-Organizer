import { adminDb } from '../../../../config/firebase-admin';

// DELETE - Delete a template
export async function DELETE(request, { params }) {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin SDK not initialized');
    }

    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { id: templateId } = resolvedParams;

    if (!templateId) {
      return new Response(JSON.stringify({ 
        error: 'Template ID is required' 
      }), { status: 400 });
    }

    console.log('Deleting template:', templateId);

    // Delete template from Firestore using Admin SDK
    const templateRef = adminDb.collection('templates').doc(templateId);
    
    // Check if template exists
    const templateDoc = await templateRef.get();
    if (!templateDoc.exists) {
      return new Response(JSON.stringify({ 
        error: 'Template not found' 
      }), { status: 404 });
    }

    // Delete the template
    await templateRef.delete();

    console.log('Template deleted successfully:', templateId);

    return new Response(JSON.stringify({
      message: 'Template deleted successfully',
      templateId,
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return new Response(JSON.stringify({ 
      error: 'Error deleting template',
      details: error.message,
      success: false
    }), { status: 500 });
  }
}
