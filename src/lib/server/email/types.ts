// Email service type definitions

export interface FeedbackEmailData {
    feedbackType: 'positive' | 'negative';
    postTitle: string;
    postSlug: string;
    name?: string;
    email?: string;
    message: string;
    adminName: string;
    adminEmail: string;
    postUrl: string;
}

export interface EmailTemplate {
    subject: string;
    textBody: string;
    htmlBody: string;
}

export interface EmailResult {
    success: boolean;
    error?: string;
}

export interface EmailProviderConfig {
    provider: 'mailtrap' | 'postmark';
    // Mailtrap config
    mailtrap?: {
        host: string;
        port: number;
        user: string;
        pass: string;
    };
    // Postmark config
    postmark?: {
        apiToken: string;
        fromEmail: string;
    };
}
