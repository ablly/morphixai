import * as React from 'react';

interface ReferralRewardEmailProps {
  username?: string;
  referredUsername: string;
  creditsEarned: number;
  totalCredits: number;
  dashboardUrl: string;
}

export function ReferralRewardEmail({
  username,
  referredUsername,
  creditsEarned,
  totalCredits,
  dashboardUrl,
}: ReferralRewardEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#0a0a0a', color: '#ffffff', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>
          <span style={{ color: '#ffffff' }}>Morphix</span>{' '}
          <span style={{ color: '#22d3ee' }}>AI</span>
        </h1>
      </div>

      <div style={{ backgroundColor: '#18181b', borderRadius: '16px', padding: '30px', border: '1px solid #27272a' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '48px' }}>🎉</span>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 20px 0', color: '#22d3ee' }}>
          You Earned {creditsEarned} Credits!
        </h2>

        <p style={{ fontSize: '16px', color: '#a1a1aa', textAlign: 'center', margin: '0 0 30px 0' }}>
          {username ? `Hey ${username}!` : 'Hey there!'} Great news - your friend{' '}
          <strong style={{ color: '#ffffff' }}>{referredUsername}</strong> just joined Morphix AI using your referral link!
        </p>

        <div style={{ backgroundColor: '#22d3ee10', border: '1px solid #22d3ee30', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#a1a1aa' }}>Credits Earned</span>
            <span style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '18px' }}>+{creditsEarned}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a1a1aa' }}>Your Total Balance</span>
            <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }}>{totalCredits} Credits</span>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', margin: '0 0 20px 0' }}>
          Keep sharing your referral link to earn more credits! You can earn up to 50 credits from referrals.
        </p>

        <div style={{ textAlign: 'center' }}>
          <a
            href={dashboardUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#22d3ee',
              color: '#000000',
              padding: '14px 32px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            Start Creating →
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ fontSize: '12px', color: '#52525b', margin: '0' }}>
          © 2025 Morphix AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
