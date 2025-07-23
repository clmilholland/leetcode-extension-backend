const express = require('express');
const mongoose = require('mongoose');
const dotenvConfig = require('dotenv');
dotenvConfig.config();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const problemRoutes = require('./routes/problemRoutes');
const extensionRoute = require('./routes/extensionRoute');

const PORT = process.env.PORT || 5000;


//Express setup
const app = express();
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/extension', extensionRoute);


//MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.log('Connection error:', err);
    });

//Basic route
app.get('/', (req, res) => {
    res.send('server is running!');
});

//Start server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})