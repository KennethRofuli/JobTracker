const cron = require('node-cron');
const Application = require('../models/Application');
const User = require('../models/User');
const emailService = require('./emailService');
const logger = require('../config/logger');

const dailySummaryCron = process.env.DAILY_SUMMARY_CRON || '0 8 * * *';
const followUpCron = process.env.FOLLOW_UP_CRON || '0 9 * * *';
const timezone = process.env.SCHEDULER_TIMEZONE || 'UTC';

const sendDailySummary = async () => {
    if (!emailService.isConfigured) {
        logger.warn('Skipping daily summary because email service is not configured.');
        return;
    }

    try {
        const users = await User.find({});

        for (const user of users) {
            const applications = await Application.find({ userId: user._id }).sort({ date_applied: -1 });
            if (!applications.length) {
                logger.info('Skipping daily summary for user with no applications', { userEmail: user.email });
                continue;
            }

            await emailService.sendDailySummaryEmail(user.email, applications);
            logger.info('Daily summary sent', { userEmail: user.email, count: applications.length });
        }
    } catch (error) {
        logger.error('Daily summary job failed', { error: error.message });
    }
};

const sendFollowUpReminders = async () => {
    if (!emailService.isConfigured) {
        logger.warn('Skipping follow-up reminders because email service is not configured.');
        return;
    }

    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const applications = await Application.find({
            date_applied: { $lte: sevenDaysAgo },
            status: 'Applied',
            followUpSentAt: null
        }).populate('userId', 'email name');

        if (!applications.length) {
            logger.info('No follow-up reminders to send at this time');
            return;
        }

        const grouped = applications.reduce((acc, application) => {
            const userEmail = application.userId?.email;
            if (!userEmail) {
                return acc;
            }

            if (!acc[userEmail]) {
                acc[userEmail] = [];
            }
            acc[userEmail].push(application);
            return acc;
        }, {});

        for (const [email, userApplications] of Object.entries(grouped)) {
            for (const application of userApplications) {
                await emailService.sendFollowUpEmail(email, application);
                application.followUpSentAt = new Date();
                await application.save();
            }
            logger.info('Follow-up reminders sent', { email, count: userApplications.length });
        }
    } catch (error) {
        logger.error('Follow-up reminder job failed', { error: error.message });
    }
};

const start = () => {
    cron.schedule(dailySummaryCron, sendDailySummary, {
        timezone
    });

    cron.schedule(followUpCron, sendFollowUpReminders, {
        timezone
    });

    logger.info('Notification scheduler started', {
        dailySummaryCron,
        followUpCron,
        timezone
    });
};

module.exports = {
    start,
    sendDailySummary,
    sendFollowUpReminders
};
