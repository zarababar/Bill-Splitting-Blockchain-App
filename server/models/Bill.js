const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    totalAmount: {
        type: String,
        required: true
    },
    selectedFriends: [{
        walletAddress: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }],
    shareStatus: {
        type: Map,
        of: new mongoose.Schema({
            paid: { type: Boolean, default: false },
            share: { type: String } // Amount in ETH or similar
        })
    }
    // Add other fields as necessary
});

const Bill = mongoose.model('Bill', BillSchema);
module.exports = Bill;
