import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface GenerationFailedUserEmailProps {
  username?: string;
  reason: string;
  creditsRefunded: number;
  supportEmail: string;
  dashboardUrl: string;
}

export function GenerationFailedUserEmail({
  username,
  reason,
  creditsRefunded,
  supportEmail,
  dashboardUrl,
}: GenerationFailedUserEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your 3D generation encountered an issue - Credits refunded</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Generation Issue</Heading>
          
          <Text style={greeting}>
            Hi {username || 'there'},
          </Text>

          <Text style={text}>
            We&apos;re sorry, but your recent 3D model generation encountered an issue and could not be completed.
          </Text>

          <Section style={reasonBox}>
            <Text style={reasonLabel}>Reason:</Text>
            <Text style={reasonText}>{reason}</Text>
          </Section>

          <Section style={refundBox}>
            <Text style={refundText}>
              ✅ Good news: We&apos;ve automatically refunded <strong>{creditsRefunded} credits</strong> to your account.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            If you continue to experience issues, please don&apos;t hesitate to contact us. We&apos;re here to help!
          </Text>

          <Section style={buttonContainer}>
            <Link href={`mailto:${supportEmail}`} style={button}>
              Contact Support
            </Link>
          </Section>

          <Section style={buttonContainer}>
            <Link href={dashboardUrl} style={secondaryButton}>
              Try Again
            </Link>
          </Section>

          <Text style={footer}>
            Thank you for using Morphix AI. We appreciate your patience!
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
};

const h1 = {
  color: '#f59e0b',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const greeting = {
  color: '#ffffff',
  fontSize: '18px',
  margin: '0 0 16px',
};

const text = {
  color: '#a1a1aa',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const reasonBox = {
  backgroundColor: '#1c1917',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  borderLeft: '4px solid #f59e0b',
};

const reasonLabel = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const reasonText = {
  color: '#fbbf24',
  fontSize: '14px',
  margin: '0',
};

const refundBox = {
  backgroundColor: '#052e16',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
};

const refundText = {
  color: '#4ade80',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#27272a',
  margin: '30px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '16px 0',
};

const button = {
  backgroundColor: '#22d3ee',
  borderRadius: '8px',
  color: '#000000',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
};

const secondaryButton = {
  backgroundColor: '#27272a',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
};

const footer = {
  color: '#52525b',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '30px 0 0',
};

export default GenerationFailedUserEmail;
