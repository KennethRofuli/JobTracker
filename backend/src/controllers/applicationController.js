const Application = require('../models/Application');

// @desc    Get all applications for logged in user
// @route   GET /api/applications
// @access  Private

exports.getApplications = async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
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
// @access Private

exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });
    
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
// @access  Private

exports.createApplication = async (req, res) => {
    try {
        // Normalize data for better duplicate detection
        const normalizedCompany = req.body.company_name?.trim().toLowerCase();
        const normalizedTitle = req.body.job_title?.trim().toLowerCase();
        
        console.log('=== CREATE APPLICATION ===');
        console.log('User ID:', req.user._id);
        console.log('User Name:', req.user.name);
        console.log('Job:', normalizedCompany, '-', normalizedTitle);
        
        // Check for duplicate (case-insensitive, trimmed) for this user
        const existingApplication = await Application.findOne({
            userId: req.user._id,
            company_name: { $regex: new RegExp(`^${normalizedCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            job_title: { $regex: new RegExp(`^${normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        console.log('Existing application found?', !!existingApplication);
        if (existingApplication) {
            console.log('Existing app userId:', existingApplication.userId);
            console.log('Current user _id:', req.user._id);
            console.log('Are they equal?', existingApplication.userId.toString() === req.user._id.toString());
        }

        if (existingApplication) {
            return res.status(409).json({
                success: false,
                error: 'This job application already exists in your tracker',
                existingApplication: existingApplication
            });
        }

        const application = await Application.create({
            ...req.body,
            userId: req.user._id
        });
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
// @access  Private

exports.updateApplication = async (req, res) => {
    try {
        // First find to verify ownership
        let application = await Application.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        // Update the application
        application = await Application.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

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
// @access  Private

exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

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