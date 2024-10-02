// models/Friend.js
const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true
    }
});

const Friend = mongoose.model('Friend', FriendSchema);
module.exports = Friend;
