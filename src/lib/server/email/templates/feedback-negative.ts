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

export function generateNegativeFeedbackEmail(data: FeedbackEmailData): EmailTemplate {
    const displayName = data.name?.trim() || 'Anonymous';
    const displayEmail = data.email?.trim() || 'Not provided';

    const subject = `New feedback for improvement on: ${data.postTitle}`;

    const textBody = `Hello ${data.adminName},

Reader ${displayName} (email: ${displayEmail}) sent the following feedback about your post, "${data.postTitle}":

${data.message}

View post: ${data.postUrl}

---
This message was sent via the FeedbackWidget on your blog.`;

    const htmlBody = `<p>Hello ${data.adminName},</p>

<p>Reader <strong>${escapeHtml(displayName)}</strong> (email: ${escapeHtml(displayEmail)}) sent the following feedback about your post, <a href="${data.postUrl}">${escapeHtml(data.postTitle)}</a>:</p>

<blockquote style="border-left: 3px solid #ef4444; padding-left: 1rem; margin: 1rem 0; color: #333; background-color: #fef2f2; padding: 1rem; border-radius: 4px;">
  ${escapeHtml(data.message)}
</blockquote>

<p><a href="${data.postUrl}" style="color: #ef4444; text-decoration: none; font-weight: 500;">View post →</a></p>

<hr style="margin: 2rem 0; border: none; border-top: 1px solid #eee;" />

<p style="font-size: 0.9rem; color: #666;">This message was sent via the FeedbackWidget on your blog.</p>`;

    return {
        subject,
        textBody,
        htmlBody
    };
}
