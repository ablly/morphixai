import { resend, EMAIL_FROM } from './resend';
import { WelcomeEmail } from './templates/welcome';
import { InviteEmail } from './templates/invite';
import { MagicLinkEmail } from './templates/magic-link';
import { ChangeEmailEmail } from './templates/change-email';
import { ResetPasswordEmail } from './templates/reset-password';
import { PurchaseSuccessEmail } from './templates/purchase-success';
import { ReferralRewardEmail } from './templates/referral-reward';
import { GenerationCompleteEmail } from './templates/generation-complete';
import { LowCreditsEmail } from './templates/low-credits';

export class EmailService {
  // 发送欢迎/确认注册邮件
  static async sendWelcomeEmail(to: string, data: { username?: string; confirmUrl: string }) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Welcome to Morphix AI - Please confirm your email',
      react: WelcomeEmail(data),
    });
  }

  // 发送邀请邮件
  static async sendInviteEmail(to: string, data: { inviterName?: string; inviteUrl: string }) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: "You've been invited to join Morphix AI",
      react: InviteEmail(data),
    });
  }

  // 发送魔法链接登录邮件
  static async sendMagicLinkEmail(to: string, data: { loginUrl: string }) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Your Morphix AI login link',
      react: MagicLinkEmail(data),
    });
  }

  // 发送更改邮箱确认邮件
  static async sendChangeEmailEmail(to: string, data: { confirmUrl: string; newEmail: string }) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Confirm your new email address - Morphix AI',
      react: ChangeEmailEmail(data),
    });
  }

  // 发送重置密码邮件
  static async sendResetPasswordEmail(to: string, data: { resetUrl: string }) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Reset your Morphix AI password',
      react: ResetPasswordEmail(data),
    });
  }

  // 发送购买成功邮件
  static async sendPurchaseSuccessEmail(
    to: string,
    data: {
      username?: string;
      packageName: string;
      credits: number;
      amount: string;
      dashboardUrl: string;
    }
  ) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Purchase confirmed - ${data.credits} credits added`,
      react: PurchaseSuccessEmail(data),
    });
  }

  // 发送推荐奖励邮件
  static async sendReferralRewardEmail(
    to: string,
    data: {
      username?: string;
      referredUsername: string;
      creditsEarned: number;
      totalCredits: number;
      dashboardUrl: string;
    }
  ) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `You earned ${data.creditsEarned} credits from a referral!`,
      react: ReferralRewardEmail(data),
    });
  }

  // 发送3D模型生成完成邮件
  static async sendGenerationCompleteEmail(
    to: string,
    data: {
      username?: string;
      modelName: string;
      viewUrl: string;
    }
  ) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Your 3D model is ready!',
      react: GenerationCompleteEmail(data),
    });
  }

  // 发送积分不足提醒邮件
  static async sendLowCreditsEmail(
    to: string,
    data: {
      username?: string;
      remainingCredits: number;
      pricingUrl: string;
    }
  ) {
    return resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Your Morphix AI credits are running low',
      react: LowCreditsEmail(data),
    });
  }
}
