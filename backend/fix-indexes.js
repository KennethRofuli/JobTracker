// Script to fix database indexes
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Application = require('./src/models/Application');

async function fixIndexes() {
    try {
        // Check if MONGO_URI is loaded
        if (!process.env.MONGO_URI) {
            console.error('ERROR: MONGO_URI not found in environment variables');
            console.log('Please make sure .env file exists in backend folder');
            process.exit(1);
        }

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Drop all indexes on the applications collection
        console.log('Dropping all indexes...');
        await Application.collection.dropIndexes();
        console.log('All indexes dropped');

        // Recreate indexes from the model
        console.log('Creating indexes from model...');
        await Application.createIndexes();
        console.log('Indexes created successfully');

        // List all indexes to verify
        const indexes = await Application.collection.getIndexes();
        console.log('\nCurrent indexes:');
        console.log(JSON.stringify(indexes, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixIndexes();
