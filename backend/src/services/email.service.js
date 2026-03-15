'use strict';

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendInviteEmail({ to, companyName, inviteUrl }) {
  await resend.emails.send({
    from: 'Flowlane <onboarding@resend.dev>',
    to,
    subject: `You've been invited to join ${companyName} on Flowlane`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #003580;">You're invited to Flowlane</h2>
        <p>You've been invited to join <strong>${companyName}</strong> on Flowlane HR platform.</p>
        <p>Click the button below to accept your invitation and set up your account:</p>
        <a href="${inviteUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #1d6fc4;
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 16px 0;
        ">Accept Invitation</a>
        <p style="color: #94a3b8; font-size: 12px;">
          This link expires in 7 days. If you didn't expect this invitation, you can ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = { sendInviteEmail };