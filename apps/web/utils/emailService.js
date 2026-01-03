// Email service for sending notifications
// In production, you should integrate with an actual email service like SendGrid, Nodemailer with SMTP, etc.

import { getAdminEmails as getRoleAdminEmails } from './roles';

/**
 * Get admin email addresses
 * @returns {Array} Array of admin email addresses
 */
export function getAdminEmails() {
  return getRoleAdminEmails();
}

/**
 * Send email notification for new help desk ticket to admins
 * @param {Object} ticketData - The ticket data
 * @param {string} ticketData.ticketNumber - Ticket number
 * @param {string} ticketData.title - Ticket title
 * @param {string} ticketData.description - Ticket description
 * @param {string} ticketData.userName - Name of user who created the ticket
 * @param {string} ticketData.userEmail - Email of user who created the ticket
 * @param {string} ticketData.priority - Ticket priority
 * @param {string} ticketData.category - Ticket category
 */
export async function sendNewTicketNotificationToAdmins(ticketData) {
  const adminEmails = getAdminEmails();
  const {
    ticketNumber,
    title,
    description,
    userName,
    userEmail,
    priority,
    category
  } = ticketData;

  const subject = `🎫 New Help Desk Ticket: ${ticketNumber} - ${title}`;
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0; font-size: 24px;">iTaskOrg Help Desk</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">New Ticket Notification</p>
        </div>
        
        <!-- Ticket Alert -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <h2 style="color: #92400e; margin: 0 0 5px 0; font-size: 18px;">🆕 New Ticket Created</h2>
          <p style="color: #92400e; margin: 0; font-size: 14px;">A new help desk ticket requires your attention.</p>
        </div>
        
        <!-- Ticket Details -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">Ticket Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Ticket #:</td>
              <td style="padding: 8px 0; color: #1e293b;">${ticketNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Title:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Priority:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: ${getPriorityColor(priority)}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                  ${priority.toUpperCase()}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Category:</td>
              <td style="padding: 8px 0; color: #1e293b;">${category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Reporter:</td>
              <td style="padding: 8px 0; color: #1e293b;">${userName} (${userEmail})</td>
            </tr>
          </table>
        </div>
        
        <!-- Description -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">Description</h3>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #3b82f6;">
            <p style="margin: 0; color: #374151; line-height: 1.6;">${description.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 25px;">
          <Link href="${getTicketUrl(ticketNumber)}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            🔍 View Ticket
          </Link>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            This is an automated notification from iTaskOrg Help Desk System<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  // Send email to all admins
  const emailPromises = adminEmails.map(adminEmail => 
    sendEmail(adminEmail, subject, emailBody)
  );

  try {
    await Promise.allSettled(emailPromises);
    console.log(`✅ New ticket notification sent to ${adminEmails.length} admins for ticket ${ticketNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending new ticket notifications to admins:', error);
    return false;
  }
}

/**
 * Send email notification to user when ticket status changes
 * @param {string} userEmail - User's email address
 * @param {Object} ticketData - The ticket data
 */
export async function sendTicketStatusUpdateToUser(userEmail, ticketData) {
  const {
    ticketNumber,
    title,
    status,
    assignedTo,
    userName
  } = ticketData;

  const subject = `📝 Ticket Update: ${ticketNumber} - ${title}`;
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0; font-size: 24px;">iTaskOrg Help Desk</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Ticket Status Update</p>
        </div>
        
        <!-- Update Alert -->
        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <h2 style="color: #1e40af; margin: 0 0 5px 0; font-size: 18px;">📝 Ticket Updated</h2>
          <p style="color: #1e40af; margin: 0; font-size: 14px;">Your help desk ticket has been updated.</p>
        </div>
        
        <!-- Ticket Details -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">Ticket Information</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Ticket #:</td>
              <td style="padding: 8px 0; color: #1e293b;">${ticketNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Title:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Status:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: ${getStatusColor(status)}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                  ${status.toUpperCase()}
                </span>
              </td>
            </tr>
            ${assignedTo ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Assigned to:</td>
              <td style="padding: 8px 0; color: #1e293b;">${assignedTo}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <!-- Action Button -->
        <div style="text-align: center; margin-bottom: 25px;">
          <Link href="${getTicketUrl(ticketNumber)}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            🔍 View Ticket
          </Link>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            This is an automated notification from iTaskOrg Help Desk System<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmail(userEmail, subject, emailBody);
    console.log(`✅ Ticket status update sent to user ${userEmail} for ticket ${ticketNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending ticket status update to user:', error);
    return false;
  }
}

/**
 * Generic email sending function using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlBody - HTML email body
 */
async function sendEmail(to, subject, htmlBody) {
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'noreply@itaskorg.com';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Check if SendGrid is configured
  if (!sendGridApiKey) {
    console.log('⚠️ SendGrid API key not found.');
    
    if (isProduction) {
      console.error('❌ PRODUCTION ERROR: SendGrid API key is required in production!');
      console.error('📧 Failed to send email to:', to);
      console.error('📧 Subject:', subject);
      return false;
    } else {
      console.log('📧 EMAIL NOTIFICATION (DEVELOPMENT - SIMULATED):');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Body Preview:', htmlBody.substring(0, 200) + '...');
      return true;
    }
  }
  
  try {
    // Import SendGrid dynamically to avoid issues if not installed
    const sgMail = (await import('@sendgrid/mail')).default;
    
    // Set API key
    sgMail.setApiKey(sendGridApiKey);
    
    const msg = {
      to: to,
      from: {
        email: fromEmail,
        name: 'iTaskOrg Help Desk'
      },
      subject: subject,
      html: htmlBody,
      // Add text version as fallback
      text: htmlBody.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    };
    
    console.log(`📧 Sending email via SendGrid to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    await sgMail.send(msg);
    
    console.log(`✅ Email sent successfully to ${to}`);
    return true;
    
  } catch (error) {
    console.error('❌ SendGrid email sending failed:', error);
    
    // Check for common SendGrid errors
    if (error.code === 403 && error.response?.body?.errors) {
      const errors = error.response.body.errors;
      const senderError = errors.find(e => e.field === 'from');
      
      if (senderError) {
        console.log('⚠️  SENDER VERIFICATION REQUIRED:');
        console.log('📧 The sender email needs to be verified in SendGrid.');
        console.log('🔗 Visit: https://app.sendgrid.com/settings/sender_auth');
        console.log('📧 Please verify your sender email in SendGrid dashboard.');
      }
    }
    
    // Fallback to console logging if SendGrid fails
    console.log('📧 EMAIL NOTIFICATION (FALLBACK - Logged to Console):');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body Preview:', htmlBody.substring(0, 200) + '...');
    
    // Don't throw error - we don't want to break ticket operations
    return false;
  }
}

/**
 * Get priority color for email styling
 * @param {string} priority - Priority level
 * @returns {string} Color code
 */
function getPriorityColor(priority) {
  switch (priority.toLowerCase()) {
    case 'high':
      return '#dc2626'; // red-600
    case 'medium':
      return '#ea580c'; // orange-600
    case 'low':
      return '#16a34a'; // green-600
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Get status color for email styling
 * @param {string} status - Ticket status
 * @returns {string} Color code
 */
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'open':
      return '#dc2626'; // red-600
    case 'in-progress':
      return '#ea580c'; // orange-600
    case 'resolved':
      return '#16a34a'; // green-600
    case 'closed':
      return '#6b7280'; // gray-500
    default:
      return '#3b82f6'; // blue-600
  }
}

/**
 * Generate URL for viewing ticket
 * @param {string} ticketNumber - Ticket number
 * @returns {string} URL to view ticket
 */
function getTicketUrl(ticketNumber) {
  // In production, use your actual domain
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/admin/help-desk?ticket=${ticketNumber}`;
}
