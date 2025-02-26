const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const predictionsFilePath = path.join(__dirname, '../data/predictions.json');
const oscarWinners = require('../models/winners'); // Import from models/winners.js  **<-- CHANGED**

function getPredictionsFromFile() {
    try {
        const rawData = fs.readFileSync(predictionsFilePath);
        return JSON.parse(rawData);
    } catch (error) {
        return {}; // Return empty object if file not found or invalid JSON
    }
}

router.get('/', (req, res) => {
    const userPredictions = getPredictionsFromFile();
    const leaderboard = calculateLeaderboard(userPredictions, oscarWinners); // **<-- Pass imported oscarWinners**
    res.json(leaderboard);
});

function calculateLeaderboard(predictions, winners) { // **<-- 'winners' parameter now correctly receives oscarWinners**
    console.log("Backend: calculateLeaderboard function called!");
    console.log("Backend: Predictions received in calculateLeaderboard:", predictions);
    console.log("Backend: Winners received in calculateLeaderboard:", winners); // Should now show the winners object

    const leaderboard = [];
    for (const userId in predictions) {
        const userData = predictions[userId];

        if (!userData || !userData.predictions) {
            console.log("Backend: WARNING! userData or userData.predictions is undefined for userId:", userId, userData);
            continue;
        }

        let score = 0;
        for (const category in userData.predictions) {
            if (winners && winners[category] && userData.predictions[category] === winners[category]) { // **Added check for 'winners' being truthy here too**
                score++;
            }
        }
        leaderboard.push({ userName: userData.userName, score });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    console.log("Backend: Final calculated leaderboard from function:", leaderboard);
    return leaderboard;
}

module.exports = router;