const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
