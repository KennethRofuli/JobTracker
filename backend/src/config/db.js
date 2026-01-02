const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Ensure indexes are created for duplicate prevention
        await conn.connection.db.collection('applications').createIndex(
            { company_name: 1, job_title: 1 },
            { 
                unique: true,
                collation: { locale: 'en', strength: 2 },
                background: true
            }
        );
        console.log('Database indexes created successfully');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;