import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM = `"${process.env.SMTP_FROM_NAME || 'Any Tradesman'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://anytradesmen.com';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function emailLayout(content: string, heading: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0a0a0a;padding:24px 32px;text-align:center;">
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">AnyTradesman</h1>
              <p style="color:#a3a3a3;font-size:12px;margin:4px 0 0 0;">Any Trade, Any Place, Any Time</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="color:#0a0a0a;font-size:22px;font-weight:600;margin:0 0 16px 0;">${heading}</h2>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f5;padding:24px 32px;text-align:center;color:#737373;font-size:12px;">
              <p style="margin:0 0 8px 0;">&copy; ${new Date().getFullYear()} AnyTradesman. All rights reserved.</p>
              <p style="margin:0;">
                <a href="${APP_URL}" style="color:#dc2626;text-decoration:none;">Visit Site</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/settings" style="color:#dc2626;text-decoration:none;">Notification Settings</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:#dc2626;border-radius:8px;">
      <a href="${url}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">${text}</a>
    </td></tr>
  </table>`;
}

export async function sendServiceRequestConfirmation(params: {
  to: string;
  customerName: string;
  requestTitle: string;
  requestId: string;
}) {
  const content = `
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Hi ${params.customerName || 'there'},</p>
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Your service request has been submitted successfully. We're now matching you with qualified professionals in your area.</p>
    <div style="background:#fafafa;border-left:4px solid #dc2626;padding:16px 20px;margin:24px 0;border-radius:4px;">
      <p style="color:#737373;font-size:12px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Your Request</p>
      <p style="color:#0a0a0a;font-size:16px;font-weight:600;margin:0;">${params.requestTitle}</p>
    </div>
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;"><strong>What happens next?</strong></p>
    <ul style="color:#404040;font-size:15px;line-height:1.6;padding-left:20px;margin:0 0 16px 0;">
      <li>Matching professionals will review your request</li>
      <li>You'll receive quotes from interested pros</li>
      <li>Compare quotes and pick the right pro for your job</li>
    </ul>
    ${button('View My Request', `${APP_URL}/my-requests`)}
    <p style="color:#737373;font-size:13px;line-height:1.6;margin:24px 0 0 0;">Questions? Reply to this email and we'll help you out.</p>
  `;
  return sendEmail({
    to: params.to,
    subject: 'Your service request has been submitted',
    html: emailLayout(content, 'Request Submitted'),
  });
}

export async function sendQuoteReceivedEmail(params: {
  to: string;
  customerName: string;
  businessName: string;
  requestTitle: string;
  amount: number;
  requestId: string;
}) {
  const content = `
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Hi ${params.customerName || 'there'},</p>
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Good news — <strong>${params.businessName}</strong> has sent you a quote for your service request.</p>
    <div style="background:#fafafa;border-left:4px solid #dc2626;padding:16px 20px;margin:24px 0;border-radius:4px;">
      <p style="color:#737373;font-size:12px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Request</p>
      <p style="color:#0a0a0a;font-size:16px;font-weight:600;margin:0 0 12px 0;">${params.requestTitle}</p>
      <p style="color:#737373;font-size:12px;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Quote Amount</p>
      <p style="color:#16a34a;font-size:24px;font-weight:700;margin:0;">$${params.amount.toFixed(2)}</p>
    </div>
    ${button('View Quote Details', `${APP_URL}/my-requests/${params.requestId}`)}
    <p style="color:#737373;font-size:13px;line-height:1.6;margin:24px 0 0 0;">The pro may also reach out to you directly using the contact details on your account.</p>
  `;
  return sendEmail({
    to: params.to,
    subject: `New quote from ${params.businessName}`,
    html: emailLayout(content, 'You received a quote!'),
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  role: 'customer' | 'business_owner';
}) {
  const isBusiness = params.role === 'business_owner';
  const content = isBusiness
    ? `
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Hi ${params.name || 'there'},</p>
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Welcome to AnyTradesman! Your business account is set up and ready.</p>
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;"><strong>Get started:</strong></p>
    <ul style="color:#404040;font-size:15px;line-height:1.6;padding-left:20px;margin:0 0 16px 0;">
      <li>Complete your business profile</li>
      <li>Select service categories you offer</li>
      <li>Subscribe to start receiving leads</li>
    </ul>
    ${button('Go to Dashboard', `${APP_URL}/dashboard`)}
  `
    : `
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Hi ${params.name || 'there'},</p>
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Welcome to AnyTradesman. Finding the right pro for your home project just got easier.</p>
    <p style="color:#404040;font-size:15px;line-height:1.6;margin:0 0 16px 0;">Ready to get started? Post a service request and qualified pros will send you quotes.</p>
    ${button('Post a Request', `${APP_URL}/request`)}
  `;
  return sendEmail({
    to: params.to,
    subject: 'Welcome to AnyTradesman',
    html: emailLayout(content, 'Welcome aboard!'),
  });
}
