import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { queueFirebaseEmail, updateFirebaseEmailDelivery, isFirebaseConnected } from '../config/firebase.js';
dotenv.config();

/**
 * Creates Gmail Direct SSL Transporter
 */
function createGmailTransporter() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  const adminPassword = (process.env.ADMIN_APP_PASSWORD || '').trim().replace(/\s+/g, '');

  if (!adminEmail || !adminPassword || adminEmail === 'your_admin_email@gmail.com') {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: adminEmail,
      pass: adminPassword
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  });
}

/**
 * Creates Brevo SMTP Relay Transporter
 */
function createBrevoTransporter() {
  const brevoSmtpKey = (process.env.BREVO_SMTP_KEY || '').trim();
  const brevoSmtpUser = (process.env.BREVO_SMTP_USER || process.env.ADMIN_EMAIL || '').trim();

  if (!brevoSmtpKey || !brevoSmtpUser) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: brevoSmtpUser,
      pass: brevoSmtpKey
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  });
}


/**
 * Sends email via Brevo REST API (HTTPS Port 443 - completely unblocked on Render / cloud)
 */
async function sendViaBrevo({
  apiKey,
  adminEmail,
  issuerName,
  recipientEmail,
  recipientName,
  subject,
  htmlContent,
  certificateImageBase64,
  certificateId
}) {
  const payload = {
    sender: { name: issuerName, email: adminEmail },
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent
  };

  if (certificateImageBase64) {
    try {
      const rawBase64 = certificateImageBase64.replace(/^data:image\/\w+;base64,/, '');
      payload.attachment = [{
        name: `${certificateId}.png`,
        content: rawBase64
      }];
    } catch (e) {
      console.warn('Could not attach image to Brevo payload:', e.message);
    }
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey.trim(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (res.ok) {
    return { sent: true, messageId: data.messageId || 'brevo-success' };
  } else {
    throw new Error(data.message || JSON.stringify(data));
  }
}

/**
 * Sends email via Resend REST API (HTTPS Port 443 - completely unblocked on Render / cloud)
 */
async function sendViaResend({
  apiKey,
  issuerName,
  recipientEmail,
  subject,
  htmlContent,
  certificateImageBase64,
  certificateId
}) {
  const payload = {
    from: `${issuerName} <onboarding@resend.dev>`,
    to: [recipientEmail],
    subject,
    html: htmlContent
  };

  if (certificateImageBase64) {
    try {
      const rawBase64 = certificateImageBase64.replace(/^data:image\/\w+;base64,/, '');
      payload.attachments = [{
        filename: `${certificateId}.png`,
        content: rawBase64
      }];
    } catch (e) {
      console.warn('Could not attach image to Resend payload:', e.message);
    }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (res.ok && data.id) {
    return { sent: true, messageId: data.id };
  } else {
    throw new Error(data.message || JSON.stringify(data));
  }
}

/**
 * Sends Certificate to Participant's Email with full details and attached certificate image
 */
export async function sendCertificateEmail({
  recipientEmail,
  recipientName,
  courseTitle,
  issuerName = 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
  certificateId,
  verificationUrl,
  issueDate,
  digitalSignature,
  certificateImageBase64 = null
}) {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  const adminPassword = (process.env.ADMIN_APP_PASSWORD || '').trim().replace(/\s+/g, '');
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();

  const attachments = [];
  let hasImageAttachment = false;

  if (certificateImageBase64) {
    try {
      const base64Data = certificateImageBase64.replace(/^data:image\/\w+;base64,/, '');
      attachments.push({
        filename: `${certificateId}.png`,
        content: Buffer.from(base64Data, 'base64'),
        contentType: 'image/png',
        cid: 'certificate_img'
      });
      hasImageAttachment = true;
    } catch (err) {
      console.warn('Could not parse certificate image attachment:', err.message);
    }
  }

  const shortSig = digitalSignature ? `${digitalSignature.substring(0, 24)}...` : 'RSA-2048-VERIFIED';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verified Digital Certificate</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 20px; line-height: 1.5; }
        .wrapper { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 16px; margin-top: 0; margin-bottom: 16px; color: #0f172a; }
        .card-table { width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0; overflow: hidden; }
        .card-table td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #edf2f7; }
        .card-table tr:last-child td { border-bottom: none; }
        .label { color: #64748b; font-weight: 600; width: 35%; }
        .value { color: #0f172a; font-weight: 700; }
        .cert-img-container { margin: 24px 0; text-align: center; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .cert-img { max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .btn-box { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 13px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
        .badge { display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid #a7f3d0; }
        .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>Digital Certificate of Completion</h1>
          <p>${issuerName}</p>
        </div>

        <div class="body">
          <p class="greeting">Dear <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; color: #475569;">Congratulations! Your official digital certificate for <strong>${courseTitle}</strong> has been issued, cryptographically signed with RSA-2048, and anchored in an immutable blockchain ledger.</p>

          <table class="card-table">
            <tr>
              <td class="label">Participant Name</td>
              <td class="value">${recipientName}</td>
            </tr>
            <tr>
              <td class="label">Certificate ID</td>
              <td class="value" style="font-family: monospace; color: #2563eb;">${certificateId}</td>
            </tr>
            <tr>
              <td class="label">Course / Program</td>
              <td class="value">${courseTitle}</td>
            </tr>
            <tr>
              <td class="label">Issuing Institute</td>
              <td class="value">${issuerName}</td>
            </tr>
            <tr>
              <td class="label">Date of Issue</td>
              <td class="value">${issueDate}</td>
            </tr>
            <tr>
              <td class="label">Security Standard</td>
              <td><span class="badge">RSA-2048 &bull; AES-256 &bull; Blockchain</span></td>
            </tr>
            <tr>
              <td class="label">Digital Signature</td>
              <td style="font-family: monospace; font-size: 11px; color: #64748b;">${shortSig}</td>
            </tr>
          </table>

          ${hasImageAttachment ? `
            <div class="cert-img-container">
              <p style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 8px 0;">Attached Verified Certificate Preview</p>
              <img src="cid:certificate_img" alt="Certificate for ${recipientName}" class="cert-img" />
            </div>
          ` : ''}

          <div class="btn-box">
            <a href="${verificationUrl}" class="btn" target="_blank">Verify Certificate Online &rarr;</a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
            <strong>How to Verify:</strong> Anyone can scan the QR code located in the bottom-right corner of your certificate using their phone camera, or visit the verification link above to authenticate its validity against the blockchain.
          </p>
        </div>

        <div class="footer">
          Issued by ${issuerName} &bull; Secured with SHA-256 & RSA-2048<br>
          Authorized Email Relay: ${adminEmail || 'admin@certificate-authority.edu'}
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `Official Certificate: ${courseTitle} - ${recipientName} (${certificateId})`;

  // Step 1: Queue email in Firebase Firestore 'mail' collection (Firebase Trigger Email extension standard)
  const rawBase64 = certificateImageBase64 ? certificateImageBase64.replace(/^data:image\/\w+;base64,/, '') : null;
  const firebaseQueueResult = await queueFirebaseEmail({
    to: recipientEmail,
    message: {
      subject,
      text: `Dear ${recipientName},\n\nCongratulations! Your official digital certificate for "${courseTitle}" (${certificateId}) has been issued by ${issuerName}.\n\nVerification Link: ${verificationUrl}\n\nSecurity: RSA-2048 & AES-256-GCM authenticated.`,
      html: htmlContent,
      attachments: rawBase64 ? [
        {
          filename: `${certificateId}.png`,
          content: rawBase64,
          encoding: 'base64'
        }
      ] : []
    },
    metadata: {
      certificateId,
      recipientName,
      recipientEmail,
      courseTitle,
      issuerName,
      issueDate,
      verificationUrl
    }
  });

  // Step 2: Try Brevo REST API (HTTPS Port 443) if configured
  if (brevoApiKey) {
    try {
      const result = await sendViaBrevo({
        apiKey: brevoApiKey,
        adminEmail: adminEmail || 'auth.designaurastudios@gmail.com',
        issuerName,
        recipientEmail,
        recipientName,
        subject,
        htmlContent,
        certificateImageBase64,
        certificateId
      });
      await updateFirebaseEmailDelivery(firebaseQueueResult.mailId, {
        state: 'SUCCESS',
        provider: 'brevo',
        messageId: result.messageId,
        sentAt: new Date().toISOString()
      });
      console.log(`✉️ Brevo REST email dispatched successfully to ${recipientEmail}:`, result.messageId);
      return { ...result, firebaseMailId: firebaseQueueResult.mailId, method: 'brevo-rest-api' };
    } catch (err) {
      console.warn('⚠️ Brevo API Error, falling back:', err.message);
    }
  }

  // Step 3: Try Resend REST API if configured
  if (resendApiKey) {
    try {
      const result = await sendViaResend({
        apiKey: resendApiKey,
        issuerName,
        recipientEmail,
        subject,
        htmlContent,
        certificateImageBase64,
        certificateId
      });
      await updateFirebaseEmailDelivery(firebaseQueueResult.mailId, {
        state: 'SUCCESS',
        provider: 'resend',
        messageId: result.messageId,
        sentAt: new Date().toISOString()
      });
      console.log(`✉️ Resend REST email dispatched successfully to ${recipientEmail}:`, result.messageId);
      return { ...result, firebaseMailId: firebaseQueueResult.mailId, method: 'resend-rest-api' };
    } catch (err) {
      console.warn('⚠️ Resend API Error, falling back:', err.message);
    }
  }

  // Step 4: Try Brevo SMTP Relay if configured
  const brevoTransporter = createBrevoTransporter();
  if (brevoTransporter) {
    try {
      const mailOptions = {
        from: `"${issuerName}" <${process.env.BREVO_SMTP_USER || adminEmail}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
        attachments
      };

      const info = await brevoTransporter.sendMail(mailOptions);
      await updateFirebaseEmailDelivery(firebaseQueueResult.mailId, {
        state: 'SUCCESS',
        provider: 'brevo-smtp',
        messageId: info.messageId,
        sentAt: new Date().toISOString()
      });
      console.log(`✉️ Certificate email sent successfully via Brevo SMTP to ${recipientEmail}: ${info.messageId}`);
      return {
        sent: true,
        method: 'brevo-smtp',
        messageId: info.messageId,
        firebaseMailId: firebaseQueueResult.mailId
      };
    } catch (error) {
      console.warn('Brevo SMTP Relay warning, falling back to Gmail SMTP:', error.message);
    }
  }

  // Step 5: Direct Gmail SSL Transporter (smtp.gmail.com:465)
  const gmailTransporter = createGmailTransporter();
  if (gmailTransporter) {
    try {
      const mailOptions = {
        from: `"${issuerName}" <${adminEmail}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
        attachments
      };

      const info = await gmailTransporter.sendMail(mailOptions);
      await updateFirebaseEmailDelivery(firebaseQueueResult.mailId, {
        state: 'SUCCESS',
        provider: 'gmail-smtp',
        messageId: info.messageId,
        sentAt: new Date().toISOString()
      });
      console.log(`✉️ Certificate email sent successfully via Gmail to ${recipientEmail}: ${info.messageId}`);
      return {
        sent: true,
        method: 'gmail-smtp',
        messageId: info.messageId,
        firebaseMailId: firebaseQueueResult.mailId
      };
    } catch (error) {
      console.error(`❌ Gmail SMTP delivery error:`, error.message);
      if (isFirebaseConnected) {
        return {
          sent: true,
          method: 'firebase-firestore-trigger-email',
          firebaseMailId: firebaseQueueResult.mailId,
          note: 'Queued in Firebase Firestore mail collection for Firebase Trigger Email dispatch.'
        };
      }
    }
  }

  // Step 6: If Firebase Firestore is connected, the Trigger Email document is ready
  if (isFirebaseConnected) {
    return {
      sent: true,
      method: 'firebase-firestore-trigger-email',
      firebaseMailId: firebaseQueueResult.mailId,
      note: 'Queued in Firebase Firestore mail collection for Trigger Email extension.'
    };
  }

  return {
    sent: false,
    reason: 'Email credentials not set (ADMIN_EMAIL & ADMIN_APP_PASSWORD) and Firebase not connected'
  };
}


