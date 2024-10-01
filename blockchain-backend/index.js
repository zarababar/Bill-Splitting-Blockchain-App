const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/blockchain-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Simple route to check server status
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
