// // index.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const Friend = require('./models/Friend'); // Import the Friend model

// const app = express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect('mongodb://localhost:27017/blockchain-app', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.error('MongoDB connection error:', err));

// // Simple route to check server status
// app.get('/', (req, res) => {
//     res.send('Backend is running!');
// });

// // Route to get the list of friends
// app.get('/api/friends', async (req, res) => {
//     try {
//         const friends = await Friend.find();
//         res.json(friends);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to fetch friends' });
//     }
// });

// // Route to add a new friend
// app.post('/api/friends', async (req, res) => {
//     const { name, walletAddress } = req.body;
//     try {
//         const newFriend = new Friend({ name, walletAddress });
//         await newFriend.save();
//         res.status(201).json(newFriend);
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to add friend' });
//     }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Friend = require('./models/Friend');
const Bill = require('./models/Bill'); // Import the Bill model

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/blockchain-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Route to get the list of friends
app.get('/api/friends', async (req, res) => {
    try {
        const friends = await Friend.find();
        res.json(friends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

// Route to add a new friend
app.post('/api/friends', async (req, res) => {
    const { name, walletAddress } = req.body;
    try {
        const newFriend = new Friend({ name, walletAddress });
        await newFriend.save();
        res.status(201).json(newFriend);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add friend' });
    }
});

// Route to create a new bill



// Route to get all bills
app.get('/api/bills', async (req, res) => {
    try {
        const bills = await Bill.find();
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bills' });
    }
});
// Route to create a new bill
app.post('/api/bills', async (req, res) => {
    const { totalAmount, selectedFriends, shareStatus } = req.body;

    // Validate input
    if (!totalAmount || !selectedFriends || selectedFriends.length === 0) {
        return res.status(400).json({ error: 'Invalid bill data' });
    }

    try {
        const newBill = new Bill({
            totalAmount,
            selectedFriends,
            shareStatus: shareStatus || {} // Optional shareStatus
        });

        await newBill.save();
        res.status(201).json(newBill);
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Assuming you're using Express and have a Bill model
app.put('/api/bills/:billId/participants', async (req, res) => {
    const { billId } = req.params;
    const { participant, paid } = req.body;

    console.log("destructure.............", billId, participant, paid);

    try {
        // Find the bill by ID
        const bill = await Bill.findById(billId);
        console.log("bill.............", bill);

        if (!bill) {
            return res.status(404).send('Bill not found');
        }

        // Check if the participant exists in the shareStatus map
        const participantStatus = bill.shareStatus.get(participant);

        if (participantStatus) {
            // Update the participant's paid status
            participantStatus.paid = paid;

            // Set the updated participant status back to the Map
            bill.shareStatus.set(participant, participantStatus);

            // Save the updated bill
            await bill.save();

            res.status(200).send('Participant paid status updated successfully');
        } else {
            return res.status(404).send('Participant not found');
        }

    } catch (error) {
        console.error('Error updating participant status:', error);
        res.status(500).send('Server error');
    }
});
// Route to update a participant's payment status
app.patch('/api/bills/:billId/participants/:walletAddress', async (req, res) => {
    const { billId, walletAddress } = req.params;
    try {
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        const participant = bill.participants.find(p => p.walletAddress === walletAddress);
        if (!participant) {
            return res.status(404).json({ error: 'Participant not found' });
        }

        // Update the payment status
        participant.paid = true; // Mark as paid

        await bill.save(); // Save the updated bill
        res.json({ message: 'Payment status updated successfully', bill });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
