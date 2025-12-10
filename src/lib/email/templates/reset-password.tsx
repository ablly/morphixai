import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <BaseLayout preview="Reset your Morphix AI password">
      <Heading style={heading}>
        Reset Your Password 🔐
      </Heading>
      
      <Text style={text}>
        We received a request to reset the password for your Morphix AI account.
      </Text>
      
      <Text style={text}>
        Click the button below to create a new password.
      </Text>

      <Button style={button} href={resetUrl}>
        Reset Password
      </Button>

      <Text style={smallText}>
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </Text>
    </BaseLayout>
  );
}

const heading = {
  margin: '0 0 20px',
  fontSize: '24px',
  color: '#ffffff',
  textAlign: 'center' as const,
};

const text = {
  margin: '0 0 20px',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#a1a1aa',
  textAlign: 'center' as const,
};

const button = {
  display: 'block',
  margin: '30px auto',
  padding: '16px 40px',
  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
  backgroundColor: '#06b6d4',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  borderRadius: '50px',
  textAlign: 'center' as const,
};

const smallText = {
  margin: '30px 0 0',
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#71717a',
  textAlign: 'center' as const,
};

export default ResetPasswordEmail;
