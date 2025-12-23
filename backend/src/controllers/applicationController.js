const Application = require('../models/Application');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Public

exports.getApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// @desc get single application
// @route GET /api/applications/:id
// @access Public

exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Public

exports.createApplication = async (req, res) => {
    try {
        // Normalize data for better duplicate detection
        const normalizedCompany = req.body.company_name?.trim().toLowerCase();
        const normalizedTitle = req.body.job_title?.trim().toLowerCase();
        
        // Check for duplicate (case-insensitive, trimmed)
        const existingApplication = await Application.findOne({
            company_name: { $regex: new RegExp(`^${normalizedCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            job_title: { $regex: new RegExp(`^${normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existingApplication) {
            return res.status(409).json({
                success: false,
                error: 'This job application already exists in your tracker',
                existingApplication: existingApplication
            });
        }

        const application = await Application.create(req.body);
        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: 'This job application already exists in your tracker'
            });
        }
        
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
}

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Public

exports.updateApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Public

exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}