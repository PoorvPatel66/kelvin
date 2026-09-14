import nodemailer from 'nodemailer';
import AppError from '../utils/AppError.js';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new AppError(`Email delivery is not configured (${name}).`, 503);
  return value;
}

export async function sendPasswordResetOtp(email, otp) {
  const transporter = nodemailer.createTransport({
    host: required('SMTP_HOST'),
    port: Number(required('SMTP_PORT')),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: required('SMTP_USER'),
      pass: required('SMTP_PASS')
    }
  });

  await transporter.sendMail({
    from: required('SMTP_FROM'),
    to: email,
    subject: 'Kelvin Admin password reset code',
    text: `Your Kelvin Admin password reset code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your Kelvin Admin password reset code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`
  });

  return true;
}
