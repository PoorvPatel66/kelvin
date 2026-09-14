import nodemailer from 'nodemailer';

function getAdminEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL || 'kelvinecoproducts@gmail.com';
}

function getFromEmail() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || 'kelvinecoproducts@gmail.com';
}

function getReplyTo(inquiry) {
  return inquiry.email || undefined;
}

function buildInquiryHtml(inquiry) {
  return `
    <h2>New Kelvin Eco Products Inquiry</h2>
    <p><strong>Type:</strong> ${inquiry.type}</p>
    <p><strong>Name:</strong> ${inquiry.name}</p>
    <p><strong>Company:</strong> ${inquiry.company || '-'}</p>
    <p><strong>Email:</strong> ${inquiry.email}</p>
    <p><strong>Phone:</strong> ${inquiry.phone || '-'}</p>
    <p><strong>Country:</strong> ${inquiry.country || '-'}</p>
    <p><strong>Product:</strong> ${inquiry.product || '-'}</p>
    <p><strong>Message:</strong> ${inquiry.message || '-'}</p>
  `;
}

async function sendViaSmtp(payload) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  });

  return transporter.sendMail({
    from: getFromEmail(),
    to: payload.to,
    replyTo: payload.replyTo,
    subject: payload.subject,
    html: payload.html
  });
}

async function sendViaResend(payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: [payload.to],
      reply_to: payload.replyTo ? [payload.replyTo] : undefined,
      subject: payload.subject,
      html: payload.html
    })
  });

  if (!response.ok) {
    throw new Error(`Resend failed with status ${response.status}`);
  }

  return response.json();
}

async function sendViaSendGrid(payload) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: process.env.SENDGRID_FROM || getFromEmail() },
      reply_to: payload.replyTo ? { email: payload.replyTo } : undefined,
      subject: payload.subject,
      content: [{ type: 'text/html', value: payload.html }]
    })
  });

  if (!response.ok) {
    throw new Error(`SendGrid failed with status ${response.status}`);
  }

  return true;
}

export async function sendInquiryNotification(inquiry) {
  const to = getAdminEmail();

  if (!to) {
    console.warn('Inquiry email skipped. ADMIN_NOTIFICATION_EMAIL is not configured.');
    return false;
  }

  const payload = {
    to,
    replyTo: getReplyTo(inquiry),
    subject: `New ${inquiry.type} inquiry from ${inquiry.name}`,
    html: buildInquiryHtml(inquiry)
  };

  try {
    if (process.env.EMAIL_PROVIDER === 'resend') {
      return await sendViaResend(payload);
    }

    if (process.env.EMAIL_PROVIDER === 'sendgrid') {
      return await sendViaSendGrid(payload);
    }

    return await sendViaSmtp(payload);
  } catch (error) {
    console.error(`Inquiry notification failed: ${error.message}`);
    return false;
  }
}
