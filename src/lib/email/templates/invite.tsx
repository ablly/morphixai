import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface InviteEmailProps {
  inviterName?: string;
  inviteUrl: string;
}

export function InviteEmail({ inviterName, inviteUrl }: InviteEmailProps) {
  return (
    <BaseLayout preview="You've been invited to join Morphix AI">
      <Heading style={heading}>
        You're Invited! 🎁
      </Heading>
      
      <Text style={text}>
        {inviterName 
          ? `${inviterName} has invited you to join Morphix AI`
          : 'Someone has invited you to join Morphix AI'
        } - the revolutionary platform that transforms 2D images into stunning 3D models.
      </Text>
      
      <Text style={text}>
        Click the button below to accept the invitation and start creating!
      </Text>

      <Button style={button} href={inviteUrl}>
        Accept Invitation
      </Button>

      <Text style={smallText}>
        If you weren't expecting this invitation, you can safely ignore this email.
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

export default InviteEmail;
