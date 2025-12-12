import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set');
}

// Use a placeholder key if not set to prevent build errors
// Actual email sending will fail gracefully at runtime
export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');

export const EMAIL_FROM = process.env.EMAIL_FROM || 'Morphix AI <noreply@morphix.ai>';

// Helper to check if email is properly configured
export const isEmailConfigured = () => !!process.env.RESEND_API_KEY;
