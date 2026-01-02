import { NextResponse } from 'next/server';
import { sendNewTicketNotificationToAdmins, sendTicketStatusUpdateToUser } from '../../../utils/emailService';

export async function POST(request) {
  try {
    const { type, ...data } = await request.json();
    
    if (type === 'new-ticket') {
      // Test new ticket notification to admins
      const result = await sendNewTicketNotificationToAdmins({
        ticketNumber: 'HD-2025-TEST',
        title: 'Test Email Integration',
        description: 'This is a test email to verify that SendGrid integration is working correctly.',
        userName: 'Test User',
        userEmail: 'test@example.com',
        priority: 'medium',
        category: 'technical'
      });
      
      return NextResponse.json({
        success: result,
        message: 'Test email sent to admins',
        type: 'new-ticket'
      });
      
    } else if (type === 'status-update') {
      // Test status update notification to user
      const userEmail = data.userEmail || 'test@example.com';
      const result = await sendTicketStatusUpdateToUser(userEmail, {
        ticketNumber: 'HD-2025-TEST',
        title: 'Test Email Integration',
        status: 'in-progress',
        assignedTo: 'Admin User',
        userName: 'Test User'
      });
      
      return NextResponse.json({
        success: result,
        message: `Test status update email sent to ${userEmail}`,
        type: 'status-update'
      });
      
    } else {
      return NextResponse.json({
        error: 'Invalid test type. Use "new-ticket" or "status-update"'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      error: 'Failed to send test email',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint',
    usage: {
      'POST /api/test-email': 'Send test emails',
      'body': {
        'new-ticket': 'Test new ticket notification to admins',
        'status-update': 'Test status update notification to user (include userEmail in body)'
      }
    },
    config: {
      sendgridConfigured: !!process.env.SENDGRID_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'noreply@itaskorg.com'
    }
  });
}
