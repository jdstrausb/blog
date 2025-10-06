import type { FeedbackEmailData, EmailTemplate } from '../types';

// HTML escaping utility
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generatePositiveFeedbackEmail(data: FeedbackEmailData): EmailTemplate {
  const displayName = data.name?.trim() || 'Anonymous';
  const displayEmail = data.email?.trim() || 'Not provided';

  const subject = `New positive feedback on: ${data.postTitle}`;

  const textBody = `Hello ${data.adminName},

Reader ${displayName} (email: ${displayEmail}) sent the following positive feedback about your post, "${data.postTitle}":

${data.message}

View post: ${data.postUrl}

---
This message was sent via the FeedbackWidget on your blog.`;

  const htmlBody = `<p>Hello ${data.adminName},</p>

<p>Reader <strong>${escapeHtml(displayName)}</strong> (email: ${escapeHtml(displayEmail)}) sent the following <strong>positive</strong> feedback about your post, <a href="${data.postUrl}">${escapeHtml(data.postTitle)}</a>:</p>

<blockquote style="border-left: 3px solid #22c55e; padding-left: 1rem; margin: 1rem 0; color: #333; background-color: #f0fdf4; padding: 1rem; border-radius: 4px;">
  ${escapeHtml(data.message)}
</blockquote>

<p><a href="${data.postUrl}" style="color: #22c55e; text-decoration: none; font-weight: 500;">View post →</a></p>

<hr style="margin: 2rem 0; border: none; border-top: 1px solid #eee;" />

<p style="font-size: 0.9rem; color: #666;">This message was sent via the FeedbackWidget on your blog.</p>`;

  return {
    subject,
    textBody,
    htmlBody
  };
}
