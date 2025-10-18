import type { EmailTemplate, EmailResult, EmailProviderConfig } from './types';
import nodemailer from 'nodemailer';

/**
 * Send email using configured provider (Mailtrap or Postmark)
 */
export async function sendEmail(
    config: EmailProviderConfig,
    to: string,
    template: EmailTemplate
): Promise<EmailResult> {
    try {
        if (config.provider === 'mailtrap' && config.mailtrap) {
            return await sendViaMailtrap(config.mailtrap, to, template);
        } else if (config.provider === 'postmark' && config.postmark) {
            return await sendViaPostmark(config.postmark, to, template);
        } else {
            // Development mode - just log the email
            console.log('[Email Service] Email provider not configured, logging email:');
            console.log('---EMAIL PREVIEW---');
            console.log('To:', to);
            console.log('Subject:', template.subject);
            console.log('Text Body:', template.textBody);
            console.log('---END EMAIL---');
            return { success: true };
        }
    } catch (error) {
        console.error('[Email Service] Error sending email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Send email via Mailtrap SMTP (for development/testing)
 */
async function sendViaMailtrap(
    config: { host: string; port: number; user: string; pass: string },
    to: string,
    template: EmailTemplate
): Promise<EmailResult> {
    try {
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            auth: {
                user: config.user,
                pass: config.pass
            }
        });

        const info = await transporter.sendMail({
            from: '"Blog Feedback System" <feedback@yourblog.local>',
            to,
            subject: template.subject,
            text: template.textBody,
            html: template.htmlBody
        });

        console.log('[Email Service] Email sent via Mailtrap:', info.messageId);
        return { success: true };
    } catch (error) {
        console.error('[Email Service] Mailtrap error:', error);
        return {
            success: false,
            error: 'Failed to send email via Mailtrap'
        };
    }
}

/**
 * Send email via Postmark API (for production)
 */
async function sendViaPostmark(
    config: { apiToken: string; fromEmail: string },
    to: string,
    template: EmailTemplate
): Promise<EmailResult> {
    try {
        const response = await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': config.apiToken
            },
            body: JSON.stringify({
                From: config.fromEmail,
                To: to,
                Subject: template.subject,
                TextBody: template.textBody,
                HtmlBody: template.htmlBody,
                MessageStream: 'outbound'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[Email Service] Postmark API error:', errorData);
            return {
                success: false,
                error: 'Failed to send email via Postmark'
            };
        }

        const result = await response.json();
        console.log('[Email Service] Email sent via Postmark:', result.MessageID);
        return { success: true };
    } catch (error) {
        console.error('[Email Service] Postmark error:', error);
        return {
            success: false,
            error: 'Failed to send email via Postmark'
        };
    }
}

/**
 * Get email provider configuration from environment variables
 */
export function getEmailConfig(): EmailProviderConfig {
    const provider = (process.env.EMAIL_PROVIDER || 'none') as 'mailtrap' | 'postmark' | 'none';

    if (provider === 'mailtrap') {
        return {
            provider: 'mailtrap',
            mailtrap: {
                host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
                port: parseInt(process.env.MAILTRAP_PORT || '2525'),
                user: process.env.MAILTRAP_USER || '',
                pass: process.env.MAILTRAP_PASS || ''
            }
        };
    }

    if (provider === 'postmark') {
        return {
            provider: 'postmark',
            postmark: {
                apiToken: process.env.POSTMARK_API_TOKEN || '',
                fromEmail: process.env.POSTMARK_FROM_EMAIL || 'system@placeholder.com'
            }
        };
    }

    // Default: no provider configured (development mode - logs only)
    return { provider: 'mailtrap' }; // Will fall through to logging
}
