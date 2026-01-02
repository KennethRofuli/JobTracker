const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
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
    .post(createApplication);

router.route('/:id')
    .get(getApplication)
    .put(updateApplication)
    .delete(deleteApplication);

module.exports = router;
