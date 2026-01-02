const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Application = require('./src/models/Application');
const User = require('./src/models/User');

async function migrateData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Get the first user (your account)
        const user = await User.findOne();
        
        if (!user) {
            console.error('No user found! Please log in first to create a user account.');
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.email})`);
        
        // Find all applications without a userId
        const applicationsWithoutUser = await Application.find({ userId: { $exists: false } });
        
        console.log(`Found ${applicationsWithoutUser.length} applications without userId`);

        if (applicationsWithoutUser.length === 0) {
            console.log('All applications already have a userId. Nothing to migrate.');
            process.exit(0);
        }

        // Update all applications to belong to this user
        const result = await Application.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: user._id } }
        );

        console.log(`✅ Successfully migrated ${result.modifiedCount} applications to ${user.name}`);
        console.log('Migration complete!');
        
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateData();
