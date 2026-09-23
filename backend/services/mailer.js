import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Creates Nodemailer Transporter using ADMIN_EMAIL and ADMIN_APP_PASSWORD
 */
function createTransporter() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  const adminPassword = (process.env.ADMIN_APP_PASSWORD || '').trim().replace(/\s+/g, '');

  if (!adminEmail || !adminPassword) {
    return null;
  }

  // Use direct SSL on port 465 with explicit connection timeouts for cloud environments like Render
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
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
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

  if (!adminEmail || !adminPassword || adminEmail === 'your_admin_email@gmail.com') {
    console.log('ℹ️  Nodemailer: ADMIN_EMAIL or ADMIN_APP_PASSWORD not configured in .env. Email dispatch simulated.');
    return {
      sent: false,
      reason: 'Email credentials not set in backend/.env (ADMIN_EMAIL & ADMIN_APP_PASSWORD)'
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { sent: false, reason: 'Failed to create mail transporter' };
  }

  const attachments = [];
  let hasImageAttachment = false;

  if (certificateImageBase64) {
    try {
      const base64Data = certificateImageBase64.replace(/^data:image\/\w+;base64,/, '');
      attachments.push({
        filename: `${certificateId}.png`,
        content: Buffer.from(base64Data, 'base64'),
        contentType: 'image/png',
        cid: 'certificate_img' // Content-ID for inline embedding
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
          Authorized Email Relay: ${adminEmail}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const mailOptions = {
      from: `"${issuerName}" <${adminEmail}>`,
      to: recipientEmail,
      subject: `Official Certificate: ${courseTitle} - ${recipientName} (${certificateId})`,
      html: htmlContent,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Certificate email sent successfully to ${recipientEmail}: ${info.messageId}`);
    return {
      sent: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error(`❌ Failed to send certificate email to ${recipientEmail}:`, error.message);
    return {
      sent: false,
      reason: error.message
    };
  }
}
