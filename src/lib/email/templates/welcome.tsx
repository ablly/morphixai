import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface WelcomeEmailProps {
  username?: string;
  confirmUrl: string;
}

export function WelcomeEmail({ username, confirmUrl }: WelcomeEmailProps) {
  return (
    <BaseLayout preview="Welcome to Morphix AI - Confirm your email">
      <Heading style={heading}>
        Welcome to Morphix AI! 🎉
      </Heading>
      
      <Text style={text}>
        {username ? `Hi ${username},` : 'Hi there,'} thank you for signing up!
      </Text>
      
      <Text style={text}>
        You're just one step away from transforming your 2D images into stunning 3D models.
      </Text>
      
      <Text style={text}>
        Click the button below to confirm your email and get started with{' '}
        <strong style={highlight}>10 free credits</strong>!
      </Text>

      <Button style={button} href={confirmUrl}>
        Confirm Email Address
      </Button>

      <Text style={smallText}>
        If you didn't create an account, you can safely ignore this email.
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

const highlight = {
  color: '#22d3ee',
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

export default WelcomeEmail;
