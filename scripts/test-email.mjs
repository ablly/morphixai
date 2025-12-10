// 测试 Resend 邮件发送
import { Resend } from 'resend';

const resend = new Resend('re_YtwMWpph_LKDJodbqEx8LN1k4kofSyrAX');

async function sendTestEmail() {
  const to = 'zqhablly@gmail.com';
  
  console.log(`📧 Sending test email to ${to}...`);
  
  const { data, error } = await resend.emails.send({
    from: 'Morphix AI <onboarding@resend.dev>',
    to: [to],
    subject: 'Welcome to Morphix AI - Test Email 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">
                      Morphix <span style="color: #22d3ee;">AI</span>
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px 40px;">
                    <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff; text-align: center;">
                      Welcome to Morphix AI! 🎉
                    </h2>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                      This is a test email to verify your Resend integration is working correctly.
                    </p>
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #a1a1aa; text-align: center;">
                      You're all set to start transforming 2D images into stunning 3D models with <strong style="color: #22d3ee;">10 free credits</strong>!
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://morphix.ai" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 50px;">
                            Get Started
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px; background-color: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1);">
                    <p style="margin: 0; font-size: 12px; color: #52525b; text-align: center;">
                      © 2024 Morphix AI. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Email sent successfully!');
  console.log('📬 Email ID:', data.id);
}

sendTestEmail();
