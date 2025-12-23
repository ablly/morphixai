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

interface GenerationFailedEmailProps {
  userId: string;
  userEmail: string;
  generationId: string;
  errorMessage: string;
  timestamp: string;
  adminUrl: string;
}

export function GenerationFailedEmail({
  userId,
  userEmail,
  generationId,
  errorMessage,
  timestamp,
  adminUrl,
}: GenerationFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>⚠️ Generation Failed - User needs attention</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Generation Failed</Heading>
          
          <Text style={text}>
            A user&apos;s 3D generation has failed. Please review and take action if needed.
          </Text>

          <Section style={infoBox}>
            <Text style={label}>User ID:</Text>
            <Text style={value}>{userId}</Text>
            
            <Text style={label}>User Email:</Text>
            <Text style={value}>{userEmail}</Text>
            
            <Text style={label}>Generation ID:</Text>
            <Text style={value}>{generationId}</Text>
            
            <Text style={label}>Error Message:</Text>
            <Text style={errorText}>{errorMessage}</Text>
            
            <Text style={label}>Timestamp:</Text>
            <Text style={value}>{timestamp}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={buttonContainer}>
            <Link href={adminUrl} style={button}>
              View in Admin Panel
            </Link>
          </Section>

          <Text style={footer}>
            This is an automated notification from Morphix AI.
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
  color: '#ef4444',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#a1a1aa',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const infoBox = {
  backgroundColor: '#18181b',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const label = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const value = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
};

const errorText = {
  color: '#ef4444',
  fontSize: '14px',
  margin: '0 0 16px',
  padding: '10px',
  backgroundColor: '#1c1917',
  borderRadius: '4px',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#27272a',
  margin: '30px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
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

const footer = {
  color: '#52525b',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '30px 0 0',
};

export default GenerationFailedEmail;
