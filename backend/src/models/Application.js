const mongoose = require('mongoose');

// Clear cached model to ensure fresh schema
if (mongoose.models.Application) {
  delete mongoose.models.Application;
}

const applicationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    company_name:{
        type: String,
        required: [true, 'Please add a company name'],
        trim :true
    },
    job_title:{
        type: String,
        required: [true, 'Please add a job title'],
        trim :true
    },
    location:{
        type: String,
        trim: true,
        default: ''
    },
    url:{
        type: String,
        trim: true,
        default: ''
    },
    date_applied:{
        type: Date,
        required: true,
        default: Date.now
    },
    source: {
        type: String,
        enum: ['Indeed', 'LinkedIn', 'Email', 'Manual', 'Glassdoor', 'OnlineJobs.ph'],
        default: 'Manual'
    },
    status:{
        type: String,
        enum: ['Applied', 'Interviewing', 'Offered', 'Rejected', 'Accepted', 'Ignored'],
        default: 'Applied'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Create compound index to prevent duplicates at database level
// This ensures no two applications can have same company + job title per user
applicationSchema.index({ 
    userId: 1,
    company_name: 1, 
    job_title: 1 
}, { 
    unique: true,
    collation: { locale: 'en', strength: 2 } // Case-insensitive
});

module.exports = mongoose.model('Application', applicationSchema);