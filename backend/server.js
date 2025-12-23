const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db')
const applicationRoutes = require('./src/routes/applications')

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/applications', applicationRoutes);

app.get('/', (req, res) =>{
    res.json({message: 'API is running'})
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})