const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { applicationValidation, validate } = require('../middleware/validation');
const { createLimiter } = require('../middleware/rateLimiter');
const {
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication
} = require('../controllers/applicationController');

// All routes require authentication
router.use(authMiddleware);

router.route('/')
    .get(getApplications)
    .post(createLimiter, applicationValidation, validate, createApplication);

router.route('/:id')
    .get(getApplication)
    .put(applicationValidation, validate, updateApplication)
    .delete(deleteApplication);

module.exports = router;
