const { body, validationResult } = require('express-validator');

// Validation rules for creating/updating applications
const applicationValidation = [
    body('company_name')
        .trim()
        .notEmpty().withMessage('Company name is required')
        .isLength({ min: 1, max: 200 }).withMessage('Company name must be between 1 and 200 characters')
        .escape(),
    
    body('job_title')
        .trim()
        .notEmpty().withMessage('Job title is required')
        .isLength({ min: 1, max: 200 }).withMessage('Job title must be between 1 and 200 characters')
        .escape(),
    
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters')
        .escape(),
    
    body('url')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('URL must be less than 2000 characters'),
    
    body('source')
        .optional()
        .isIn(['Indeed', 'LinkedIn', 'Email', 'Manual', 'Glassdoor', 'OnlineJobs.ph'])
        .withMessage('Invalid source'),
    
    body('status')
        .optional()
        .isIn(['Applied', 'Interviewing', 'Offered', 'Rejected', 'Accepted', 'Ignored'])
        .withMessage('Invalid status'),
    
    body('date_applied')
        .optional()
        .isISO8601().withMessage('Invalid date format')
];

// Validation rules for updating only (partial updates allowed)
const updateValidation = [
    body('company_name')
        .optional()
        .trim()
        .notEmpty().withMessage('Company name cannot be empty if provided')
        .isLength({ min: 1, max: 200 }).withMessage('Company name must be between 1 and 200 characters')
        .escape(),
    
    body('job_title')
        .optional()
        .trim()
        .notEmpty().withMessage('Job title cannot be empty if provided')
        .isLength({ min: 1, max: 200 }).withMessage('Job title must be between 1 and 200 characters')
        .escape(),
    
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters')
        .escape(),
    
    body('url')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('URL must be less than 2000 characters'),
    
    body('source')
        .optional()
        .isIn(['Indeed', 'LinkedIn', 'Email', 'Manual', 'Glassdoor', 'OnlineJobs.ph'])
        .withMessage('Invalid source'),
    
    body('status')
        .optional()
        .isIn(['Applied', 'Interviewing', 'Offered', 'Rejected', 'Accepted', 'Ignored'])
        .withMessage('Invalid status'),
    
    body('date_applied')
        .optional()
        .isISO8601().withMessage('Invalid date format')
];

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = { applicationValidation, updateValidation, validate };
