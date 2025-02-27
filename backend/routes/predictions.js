const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const predictionsFilePath = path.join(__dirname, '../data/predictions.json');

// Helper function to read predictions from file (same as before)
function getPredictionsFromFile() {
    try {
        const rawData = fs.readFileSync(predictionsFilePath);
        return JSON.parse(rawData);
    } catch (error) {
        return {};
    }
}

// Helper function to save predictions to file (same as before)
function savePredictionsToFile(predictions) {
    const jsonData = JSON.stringify(predictions, null, 2);
    fs.writeFileSync(predictionsFilePath, jsonData);
}

let userPredictions = getPredictionsFromFile();
let nextUserId = Object.keys(userPredictions).length > 0 ? Math.max(...Object.keys(userPredictions).map(id => parseInt(id.split('-')[1]))) + 1 : 1;


router.post('/', (req, res) => {
    const { userName, predictions } = req.body;

    if (!userName || !predictions || typeof predictions !== 'object') {
        return res.status(400).json({ message: 'Invalid request data.' });
    }

    const userId = `user-${nextUserId++}`;
    userPredictions[userId] = { userName, predictions };

    savePredictionsToFile(userPredictions);

    res.status(201).json({ message: 'Predictions submitted successfully!', userId: userId });
});

router.get('/', (req, res) => {
    res.json(userPredictions); // For debugging/admin - see all predictions
});

// --- NEW ENDPOINT: GET /api/usernames ---
router.get('/usernames', (req, res) => {
    const predictions = getPredictionsFromFile(); // Load predictions data
    const usernames = Object.values(predictions) // Get the array of prediction objects
                                  .map(prediction => prediction.userName); // Extract userName from each
    res.json(usernames); // Return an array of usernames as JSON
});

module.exports = router;