import { Button, Heading, Text, Section, Row, Column } from '@react-email/components';
import * as React from 'react';
import { BaseLayout } from './base-layout';

interface PurchaseSuccessEmailProps {
  username?: string;
  packageName: string;
  credits: number;
  amount: string;
  dashboardUrl: string;
}

export function PurchaseSuccessEmail({ 
  username, 
  packageName, 
  credits, 
  amount, 
  dashboardUrl 
}: PurchaseSuccessEmailProps) {
  return (
    <BaseLayout preview={`Purchase confirmed - ${credits} credits added to your account`}>
      <Heading style={heading}>
        Purchase Successful! 🎉
      </Heading>
      
      <Text style={text}>
        {username ? `Hi ${username},` : 'Hi there,'} your purchase has been confirmed!
      </Text>

      <Section style={orderBox}>
        <Row>
          <Column>
            <Text style={orderLabel}>Package</Text>
            <Text style={orderValue}>{packageName}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={orderLabel}>Credits Added</Text>
            <Text style={creditsValue}>{credits} credits</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={orderLabel}>Amount Paid</Text>
            <Text style={orderValue}>{amount}</Text>
          </Column>
        </Row>
      </Section>
      
      <Text style={text}>
        Your credits have been added to your account and are ready to use!
      </Text>

      <Button style={button} href={dashboardUrl}>
        Start Creating
      </Button>

      <Text style={smallText}>
        Thank you for choosing Morphix AI!
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

const orderBox = {
  backgroundColor: 'rgba(0,0,0,0.3)',
  borderRadius: '12px',
  padding: '20px',
  margin: '20px 0',
};

const orderLabel = {
  margin: '0',
  fontSize: '12px',
  color: '#71717a',
  textTransform: 'uppercase' as const,
};

const orderValue = {
  margin: '4px 0 16px',
  fontSize: '16px',
  color: '#ffffff',
};

const creditsValue = {
  margin: '4px 0 16px',
  fontSize: '20px',
  fontWeight: 'bold',
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

export default PurchaseSuccessEmail;
