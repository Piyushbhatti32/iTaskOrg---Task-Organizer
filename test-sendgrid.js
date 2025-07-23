// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Uncomment the line below if you are sending mail using a regional EU subuser
// sgMail.setDataResidency('eu'); 

const msg = {
  to: 'piyushbhatti32@gmail.com', // Your email as recipient
  from: 'itaskorg@gmail.com', // Your verified sender in SendGrid
  subject: 'SendGrid Test - iTaskOrg Integration',
  text: 'This is a test email from your iTaskOrg help desk system using SendGrid!',
  html: '<strong>This is a test email from your iTaskOrg help desk system using SendGrid!</strong><br><br>🎉 Your SendGrid integration is working correctly!',
};

console.log('🚀 Testing SendGrid email integration...');
console.log('📧 Sending test email...');

sgMail
  .send(msg)
  .then(() => {
    console.log('✅ Email sent successfully!');
    console.log('📨 Check your inbox for the test email.');
  })
  .catch((error) => {
    console.error('❌ Error sending email:', error);
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
  });
