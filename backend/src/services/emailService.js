const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const host = process.env.EMAIL_SMTP_HOST;
const port = Number(process.env.EMAIL_SMTP_PORT || 587);
const secure = process.env.EMAIL_SMTP_SECURE === 'true';
const user = process.env.EMAIL_SMTP_USER;
const pass = process.env.EMAIL_SMTP_PASS;
const from = process.env.EMAIL_FROM || user;

const isConfigured = Boolean(host && user && pass);

let transporter;
if (isConfigured) {
    transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            logger.error('Email transporter verification failed', { error: error.message });
        } else {
            logger.info('Email transporter is configured and ready');
        }
    });
} else {
    logger.warn('Email service is not configured. Set EMAIL_SMTP_HOST, EMAIL_SMTP_USER, and EMAIL_SMTP_PASS.');
}

const sendEmail = async ({ to, subject, text, html }) => {
    if (!isConfigured || !transporter) {
        throw new Error('Email service is not configured');
    }

    const message = {
        from,
        to,
        subject,
        text,
        html
    };

    return transporter.sendMail(message);
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
