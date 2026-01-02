const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Load environment variables FIRST before importing other modules
dotenv.config();

const connectDB = require('./src/config/db');
const passport = require('./src/config/passport');
const applicationRoutes = require('./src/routes/applications');
const authRoutes = require('./src/routes/auth');

const app = express();

connectDB();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/', (req, res) =>{
    res.json({message: 'API is running'})
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})