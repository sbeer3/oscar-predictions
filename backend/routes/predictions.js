const express = require('express');
const router = express.Router();
const fs = require('fs'); // Node.js file system module
const path = require('path');

const predictionsFilePath = path.join(__dirname, '../data/predictions.json');

// Helper function to read predictions from file
function getPredictionsFromFile() {
    try {
        const rawData = fs.readFileSync(predictionsFilePath);
        return JSON.parse(rawData);
    } catch (error) {
        // If file doesn't exist or JSON is invalid, return empty object
        return {};
    }
}

// Helper function to write predictions to file
function savePredictionsToFile(predictions) {
    const jsonData = JSON.stringify(predictions, null, 2); // Pretty print JSON
    fs.writeFileSync(predictionsFilePath, jsonData);
}

// Load existing predictions from file when server starts (or route file is loaded)
let userPredictions = getPredictionsFromFile();
let nextUserId = Object.keys(userPredictions).length > 0 ? Math.max(...Object.keys(userPredictions).map(id => parseInt(id.split('-')[1]))) + 1 : 1;


router.post('/', (req, res) => {
    const { userName, predictions } = req.body;

    if (!userName || !predictions || typeof predictions !== 'object') {
        return res.status(400).json({ message: 'Invalid request data.' });
    }

    const userId = `user-${nextUserId++}`; // Simple unique user ID
    userPredictions[userId] = { userName, predictions };

    savePredictionsToFile(userPredictions); // **Save predictions to JSON file**

    res.status(201).json({ message: 'Predictions submitted successfully!', userId: userId });
});

router.get('/', (req, res) => {
    res.json(userPredictions); // For debugging/admin - see all predictions (from file now)
});

module.exports = router;