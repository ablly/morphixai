import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface ChangeEmailProps {
  confirmUrl: string;
  newEmail: string;
}

export function ChangeEmailEmail({ confirmUrl, newEmail }: ChangeEmailProps) {
  return (
    <BaseLayout preview="Confirm your new email address - Morphix AI">
      <Heading style={heading}>
        Confirm Your New Email 📧
      </Heading>
      
      <Text style={text}>
        You requested to change your email address for your Morphix AI account to:
      </Text>
      
      <Text style={emailText}>
        {newEmail}
      </Text>
      
      <Text style={text}>
        Click the button below to confirm this change.
      </Text>

      <Button style={button} href={confirmUrl}>
        Confirm New Email
      </Button>

      <Text style={smallText}>
        If you didn't request this change, please secure your account immediately.
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

const emailText = {
  margin: '0 0 20px',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#22d3ee',
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

export default ChangeEmailEmail;
