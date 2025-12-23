const express = require('express');
const router = express.Router();
const {
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication
} = require('../controllers/applicationController');

router.route('/')
    .get(getApplications)
    .post(createApplication);

router.route('/:id')
    .get(getApplication)
    .put(updateApplication)
    .delete(deleteApplication);

module.exports = router;
