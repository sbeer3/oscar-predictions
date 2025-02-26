const express = require('express');
const router = express.Router();
const oscarWinners = require('../models/winners'); // Import from models/winners.js
// const leaderboardModule = require('./leaderboard'); // REMOVE this line - no longer needed for oscarWinners

router.post('/set-winner', (req, res) => {
    const winners = req.body;

    if (!winners || typeof winners !== 'object' || Object.keys(winners).length === 0) { // Added check for winners being truthy
        return res.status(400).json({ message: 'Invalid winner data provided.' });
    }

    // Clear existing winners before setting new ones (replace all at once approach)
    Object.keys(oscarWinners).forEach(key => delete oscarWinners[key]); // Clear previous winners

    for (const category in winners) {
        oscarWinners[category] = winners[category]; // Set winners from the request body
    }
    res.json({ message: 'Winners set successfully!', winners: oscarWinners });
});

router.get('/winners', (req, res) => {
    res.json(oscarWinners); // Admin view of winners
});

router.get('/leaderboard', (req, res) => { // Admin view of leaderboard - You might need to adjust this if you were relying on leaderboardModule here. If you were just using it for oscarWinners, you can remove this line too if not needed for calculateLeaderboard
    const leaderboardModule = require('./leaderboard'); // Import here if still needed for calculateLeaderboard in admin routes
    const leaderboard = leaderboardModule.calculateLeaderboard(require('./predictions').userPredictions, oscarWinners); // Pass oscarWinners (now imported from models/winners.js)
    res.json(leaderboard);
});


module.exports = router;