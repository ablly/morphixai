import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface LowCreditsEmailProps {
  username?: string;
  remainingCredits: number;
  pricingUrl: string;
}

export function LowCreditsEmail({ 
  username, 
  remainingCredits, 
  pricingUrl 
}: LowCreditsEmailProps) {
  return (
    <BaseLayout preview="Your Morphix AI credits are running low">
      <Heading style={heading}>
        Credits Running Low ⚠️
      </Heading>
      
      <Text style={text}>
        {username ? `Hi ${username},` : 'Hi there,'}
      </Text>
      
      <Text style={text}>
        You have <strong style={warningHighlight}>{remainingCredits} credits</strong> remaining in your Morphix AI account.
      </Text>
      
      <Text style={text}>
        Top up now to continue creating amazing 3D models without interruption!
      </Text>

      <Button style={button} href={pricingUrl}>
        Get More Credits
      </Button>

      <Text style={smallText}>
        First-time purchase? Enjoy <strong style={highlight}>15% off</strong> your first order!
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

const warningHighlight = {
  color: '#fbbf24',
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

export default LowCreditsEmail;
