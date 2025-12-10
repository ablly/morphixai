import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface MagicLinkEmailProps {
  loginUrl: string;
}

export function MagicLinkEmail({ loginUrl }: MagicLinkEmailProps) {
  return (
    <BaseLayout preview="Your Morphix AI login link">
      <Heading style={heading}>
        Your Magic Login Link ✨
      </Heading>
      
      <Text style={text}>
        Click the button below to securely log in to your Morphix AI account. No password needed!
      </Text>
      
      <Text style={smallText}>
        This link will expire in 24 hours.
      </Text>

      <Button style={button} href={loginUrl}>
        Log In to Morphix AI
      </Button>

      <Text style={smallText}>
        If you didn't request this link, you can safely ignore this email.
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
  margin: '20px 0 0',
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#71717a',
  textAlign: 'center' as const,
};

export default MagicLinkEmail;
