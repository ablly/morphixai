// 检查邮件发送状态
import { Resend } from 'resend';

const resend = new Resend('re_YtwMWpph_LKDJodbqEx8LN1k4kofSyrAX');

async function checkEmail() {
  // 获取最近发送的邮件
  const { data, error } = await resend.emails.get('1c11c9e8-66e5-4c37-ab21-d4596f912883');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('📧 Email Status:');
  console.log(JSON.stringify(data, null, 2));
}

checkEmail();
