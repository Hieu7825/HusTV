// utils/email.js
import nodemailer from "nodemailer";

// Create transporter with Brevo SMTP
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email helper
 * @param {Object} params - Email parameters
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"HusTV" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Subscription Confirmation Email
 */
export const sendSubscriptionConfirmation = async ({
  userEmail,
  userName,
  planName,
  price,
  expiryDate,
  features,
}) => {
  const subject = `Welcome to ${planName} - HusTV`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .plan-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 8px 0; padding-left: 25px; position: relative; }
        .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to HusTV!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Thank you for subscribing to <strong>${planName}</strong>! Your subscription is now active.</p>
          
          <div class="plan-info">
            <h3>📋 Subscription Details</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Price:</strong> $${price}/month</p>
            <p><strong>Expires:</strong> ${new Date(
              expiryDate
            ).toLocaleDateString()}</p>
            
            <h4>✨ Your Features:</h4>
            <ul class="feature-list">
              ${features.map((f) => `<li>${f}</li>`).join("")}
            </ul>
          </div>

          <p>Start watching thousands of movies and shows now!</p>
          <a href="${
            process.env.WEBSITE_URL
          }/browse" class="button">Start Watching</a>

          <div class="footer">
            <p>Questions? Contact us at support@hustv.com</p>
            <p>&copy; ${new Date().getFullYear()} HusTV. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to HusTV, ${userName}!
    
    Your ${planName} subscription is now active.
    
    Plan: ${planName}
    Price: $${price}/month
    Expires: ${new Date(expiryDate).toLocaleDateString()}
    
    Features: ${features.join(", ")}
    
    Start watching at: ${process.env.WEBSITE_URL}/browse
  `;

  return sendEmail({ to: userEmail, subject, html, text });
};

/**
 * Subscription Upgrade Email
 */
export const sendUpgradeConfirmation = async ({
  userEmail,
  userName,
  oldPlanName,
  newPlanName,
  upgradePrice,
  expiryDate,
  newFeatures,
}) => {
  const subject = `Subscription Upgraded to ${newPlanName} - HusTV`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .upgrade-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 8px 0; padding-left: 25px; position: relative; }
        .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #f5576c; font-weight: bold; }
        .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Upgrade Successful!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Great news! Your subscription has been upgraded to <strong>${newPlanName}</strong>.</p>
          
          <div class="upgrade-box">
            <h3>📊 Upgrade Summary</h3>
            <p><strong>From:</strong> ${oldPlanName}</p>
            <p><strong>To:</strong> ${newPlanName}</p>
            <p><strong>Upgrade Price:</strong> $${upgradePrice}</p>
            <p><strong>Valid Until:</strong> ${new Date(
              expiryDate
            ).toLocaleDateString()}</p>
            
            <h4>🎁 New Features Unlocked:</h4>
            <ul class="feature-list">
              ${newFeatures.map((f) => `<li>${f}</li>`).join("")}
            </ul>
          </div>

          <p>Enjoy your enhanced streaming experience!</p>
          <a href="${
            process.env.WEBSITE_URL
          }/browse" class="button">Continue Watching</a>

          <div class="footer">
            <p>Questions? Contact us at support@hustv.com</p>
            <p>&copy; ${new Date().getFullYear()} HusTV. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Upgrade Successful!
    
    Hi ${userName},
    
    Your subscription has been upgraded:
    From: ${oldPlanName}
    To: ${newPlanName}
    Upgrade Price: $${upgradePrice}
    Valid Until: ${new Date(expiryDate).toLocaleDateString()}
    
    New Features: ${newFeatures.join(", ")}
    
    Continue watching at: ${process.env.WEBSITE_URL}/browse
  `;

  return sendEmail({ to: userEmail, subject, html, text });
};

/**
 * Subscription Expiry Reminder
 */
export const sendExpiryReminder = async ({
  userEmail,
  userName,
  planName,
  expiryDate,
  daysRemaining,
}) => {
  const subject = `Your ${planName} expires in ${daysRemaining} days - HusTV`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #ffc107; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Subscription Expiring Soon</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>This is a friendly reminder that your <strong>${planName}</strong> subscription will expire soon.</p>
          
          <div class="warning-box">
            <h3>⚠️ Important Information</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Expires:</strong> ${new Date(
              expiryDate
            ).toLocaleDateString()}</p>
            <p><strong>Days Remaining:</strong> ${daysRemaining} days</p>
          </div>

          <p>Don't miss out on your favorite shows! Renew now to keep watching.</p>
          <a href="${
            process.env.WEBSITE_URL
          }/subscription/renew" class="button">Renew Subscription</a>

          <div class="footer">
            <p>Questions? Contact us at support@hustv.com</p>
            <p>&copy; ${new Date().getFullYear()} HusTV. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Subscription Expiring Soon
    
    Hi ${userName},
    
    Your ${planName} subscription will expire in ${daysRemaining} days.
    
    Expiry Date: ${new Date(expiryDate).toLocaleDateString()}
    
    Renew now: ${process.env.WEBSITE_URL}/subscription/renew
  `;

  return sendEmail({ to: userEmail, subject, html, text });
};

/**
 * Payment Receipt Email
 */
export const sendPaymentReceipt = async ({
  userEmail,
  userName,
  planName,
  amount,
  transactionId,
  paymentDate,
}) => {
  const subject = `Payment Receipt - HusTV`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4a5568; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Receipt</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Thank you for your payment. Here's your receipt:</p>
          
          <div class="receipt-box">
            <h3>Payment Details</h3>
            <div class="receipt-row">
              <span>Plan:</span>
              <span>${planName}</span>
            </div>
            <div class="receipt-row">
              <span>Amount:</span>
              <span>$${amount}</span>
            </div>
            <div class="receipt-row">
              <span>Transaction ID:</span>
              <span>${transactionId}</span>
            </div>
            <div class="receipt-row">
              <span>Date:</span>
              <span>${new Date(paymentDate).toLocaleDateString()}</span>
            </div>
            <div class="receipt-row total">
              <span>Total Paid:</span>
              <span>$${amount}</span>
            </div>
          </div>

          <p>Keep this email for your records.</p>

          <div class="footer">
            <p>Questions? Contact us at support@hustv.com</p>
            <p>&copy; ${new Date().getFullYear()} HusTV. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Payment Receipt
    
    Hi ${userName},
    
    Payment Details:
    Plan: ${planName}
    Amount: $${amount}
    Transaction ID: ${transactionId}
    Date: ${new Date(paymentDate).toLocaleDateString()}
    
    Total Paid: $${amount}
  `;

  return sendEmail({ to: userEmail, subject, html, text });
};

export default {
  sendSubscriptionConfirmation,
  sendUpgradeConfirmation,
  sendExpiryReminder,
  sendPaymentReceipt,
  sendEmail,
};
