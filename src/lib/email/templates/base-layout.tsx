import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>
              Morphix <span style={logoAccent}>AI</span>
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 Morphix AI. All rights reserved.
            </Text>
            <Text style={footerText}>
              Transform your imagination into 3D reality.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#1a1a2e',
  borderRadius: '16px 16px 0 0',
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0',
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
};

const logoAccent = {
  color: '#22d3ee',
};

const content = {
  backgroundColor: '#1a1a2e',
  padding: '20px 40px 40px',
};

const footer = {
  backgroundColor: 'rgba(26, 26, 46, 0.8)',
  borderRadius: '0 0 16px 16px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  padding: '20px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  margin: '0',
  fontSize: '12px',
  color: '#52525b',
};
