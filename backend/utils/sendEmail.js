const nodemailer = require('nodemailer');

const buildTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      tls: {
        rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  throw new Error('Email configuration missing');
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = await buildTransporter();
  const from = process.env.EMAIL_FROM || 'AI Content Generator <no-reply@aicontent.local>';

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Password reset email preview: ${previewUrl}`);
  }

  return info;
};

module.exports = sendEmail;
