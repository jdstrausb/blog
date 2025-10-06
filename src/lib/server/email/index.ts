/**
 * Email Service
 *
 * Centralized email sending service for the blog application.
 * Inspired by Rails ActionMailer architecture for maintainability.
 */

import { sendEmail, getEmailConfig } from './mailer';
import { generatePositiveFeedbackEmail } from './templates/feedback-positive';
import { generateNegativeFeedbackEmail } from './templates/feedback-negative';
import type { EmailResult } from './types';

export interface SendFeedbackEmailParams {
  feedbackType: 'positive' | 'negative';
  postTitle: string;
  postSlug: string;
  name?: string;
  email?: string;
  message: string;
  baseUrl: string;
}

/**
 * Send feedback email to admin
 *
 * @param params - Feedback email parameters
 * @returns EmailResult with success status
 */
export async function sendFeedbackEmail(params: SendFeedbackEmailParams): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL || 'jstrausb86@gmail.com';
  const adminName = process.env.ADMIN_NAME || 'Jamie';

  // Construct post URL
  const postUrl = `${params.baseUrl}/blog/${params.postSlug}`;

  // Prepare email data
  const emailData = {
    feedbackType: params.feedbackType,
    postTitle: params.postTitle,
    postSlug: params.postSlug,
    name: params.name,
    email: params.email,
    message: params.message,
    adminName,
    adminEmail,
    postUrl
  };

  // Generate email template based on feedback type
  const template =
    params.feedbackType === 'positive'
      ? generatePositiveFeedbackEmail(emailData)
      : generateNegativeFeedbackEmail(emailData);

  // Get email provider configuration
  const config = getEmailConfig();

  // Send email
  const result = await sendEmail(config, adminEmail, template);

  // Log result
  if (result.success) {
    console.log(
      `[FeedbackWidget] Successfully sent ${params.feedbackType} feedback email for "${params.postTitle}"`
    );
  } else {
    console.error(
      `[FeedbackWidget Error] Failed to send ${params.feedbackType} feedback for "${params.postTitle}":`,
      result.error
    );
  }

  return result;
}

// Re-export types for convenience
export type { EmailResult } from './types';
