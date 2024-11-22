// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToMongoDB } = require('./connection');
const reportRoute=require('./routes/report');
const app = express();
const PORT = 3000;


connectToMongoDB('mongodb://127.0.0.1:27017/result')
.then(()=>console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));


app.use(cors({
    origin: 'http://localhost:5173'  // Frontend origin
}));
// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/',reportRoute);
let analysisResults = {};

// POST endpoint to send the folder name and get analyzed results
app.post('/process', async (req, res) => {
    try {
        const { folderName } = req.body;

        if (!folderName) {
            return res.status(400).json({ error: 'folderName is required' });
        }

        // Send the folderName to the /analyze endpoint
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderName }),
        });

        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to analyze folder' });
        }

        const data = await response.json();

        // Store the result in the global analysisResults object
        analysisResults[folderName] = data;

        res.json({ message: 'Folder processed successfully', data });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// GET endpoint to retrieve the analyzed results
app.get('/results', (req, res) => {
    res.json(analysisResults);
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/analyze`);
});