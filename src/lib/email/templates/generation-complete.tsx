import { Button, Heading, Text } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface GenerationCompleteEmailProps {
  username?: string;
  modelName: string;
  viewUrl: string;
}

export function GenerationCompleteEmail({ 
  username, 
  modelName, 
  viewUrl 
}: GenerationCompleteEmailProps) {
  return (
    <BaseLayout preview="Your 3D model is ready!">
      <Heading style={heading}>
        Your 3D Model is Ready! 🚀
      </Heading>
      
      <Text style={text}>
        {username ? `Hi ${username},` : 'Hi there,'} great news!
      </Text>
      
      <Text style={text}>
        Your 3D model <strong style={highlight}>"{modelName}"</strong> has been successfully generated and is ready to view.
      </Text>

      <Button style={button} href={viewUrl}>
        View Your Model
      </Button>

      <Text style={smallText}>
        You can download, share, or continue editing your model from the dashboard.
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

export default GenerationCompleteEmail;
