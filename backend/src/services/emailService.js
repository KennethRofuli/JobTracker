const sgMail = require('@sendgrid/mail');
const logger = require('../config/logger');

const sendGridApiKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_SMTP_PASS;
const from = process.env.EMAIL_FROM || process.env.SENDGRID_FROM;
const isConfigured = Boolean(sendGridApiKey && from);

if (isConfigured) {
    sgMail.setApiKey(sendGridApiKey);
    setTimeout(async () => {
        try {
            await sgMail.send({
                to: from,
                from,
                subject: 'SendGrid configuration test',
                text: 'SendGrid is configured and ready to send email from Job Tracker.'
            });
            logger.info('SendGrid is configured and ready');
        } catch (error) {
            logger.error('SendGrid verification failed', { error: error.message });
        }
    }, 5000);
} else {
    logger.warn('Email service is not configured. Set SENDGRID_API_KEY and EMAIL_FROM.');
}

const formatHtml = (text) => {
    return text ? text.replace(/\n/g, '<br/>') : undefined;
};

const sendEmail = async ({ to, subject, text, html }) => {
    if (!isConfigured) {
        const message = 'SendGrid email service is not configured. Set SENDGRID_API_KEY and EMAIL_FROM.';
        logger.warn(message);
        throw new Error(message);
    }

    try {
        const message = {
            from,
            to,
            subject,
            text,
            html: html || formatHtml(text)
        };

        const [response] = await sgMail.send(message);
        logger.info('Email sent successfully', { to, subject, statusCode: response.statusCode });
        return response;
    } catch (error) {
        logger.error('Failed to send email', { error: error.message, to, subject });
        throw error;
    }
};

const formatApplicationDetails = (application) => {
    return [`Company: ${application.company_name}`,
        `Role: ${application.job_title}`,
        `Date Applied: ${application.date_applied ? application.date_applied.toISOString().split('T')[0] : 'N/A'}`,
        `Status: ${application.status}`,
        `Notes: ${application.notes || 'None'}`].join('\n');
};

const sendNewApplicationEmail = async (to, application) => {
    const subject = `Job Application Logged: ${application.company_name} - ${application.job_title}`;
    const text = [`A new job application was added to your tracker.`, '', formatApplicationDetails(application)].join('\n');
    return sendEmail({ to, subject, text });
};

const sendFollowUpEmail = async (to, application) => {
    const subject = `Follow-up reminder: ${application.company_name} - ${application.job_title}`;
    const text = [
        'This is a reminder to follow up on a job application that is 7 days old.',
        '',
        formatApplicationDetails(application),
        '',
        'If you have not heard back yet, consider sending a quick follow-up message or updating the application status.'
    ].join('\n');
    return sendEmail({ to, subject, text });
};

const sendDailySummaryEmail = async (to, applications) => {
    const subject = 'Daily Job Application Summary';
    const header = `Here is your daily job application summary for ${new Date().toISOString().split('T')[0]}:\n\n`;
    const rows = applications.map((application, index) => {
        const details = [`Company: ${application.company_name}`,
            `Role: ${application.job_title}`,
            `Date Applied: ${application.date_applied ? application.date_applied.toISOString().split('T')[0] : 'N/A'}`,
            `Status: ${application.status}`,
            `Notes: ${application.notes || 'None'}`].join('\n');
        return `${index + 1}.\n${details}`;
    }).join('\n\n');

    const text = header + rows;
    return sendEmail({ to, subject, text });
};

module.exports = {
    isConfigured,
    sendEmail,
    sendNewApplicationEmail,
    sendFollowUpEmail,
    sendDailySummaryEmail
};
