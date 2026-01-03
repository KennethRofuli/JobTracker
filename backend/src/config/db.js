const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Fix indexes - drop old wrong index and create correct one
        const collection = conn.connection.db.collection('applications');
        
        // Try to drop the old incorrect index (without userId)
        try {
            await collection.dropIndex('company_name_1_job_title_1');
            console.log('Dropped old incorrect index');
        } catch (e) {
            // Index might not exist, that's ok
            console.log('Old index not found (ok if first run)');
        }
        
        // Create correct index with userId
        await collection.createIndex(
            { userId: 1, company_name: 1, job_title: 1 },
            { 
                unique: true,
                collation: { locale: 'en', strength: 2 },
                background: true
            }
        );
        console.log('Database indexes created successfully with userId');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;