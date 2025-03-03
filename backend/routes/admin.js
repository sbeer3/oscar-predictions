const express = require('express');
const router = express.Router();
const winnerModule = require('../models/winners'); // Import from models/winners.js
const oscarWinners = winnerModule.winners;
const gameSettings = winnerModule.settings;

// Utility function to emit winners update via socket.io
const emitWinnersUpdate = (req) => {
    const io = req.app.get('io');
    
    if (io) {
        // Calculate fresh leaderboard data
        const leaderboardModule = require('./leaderboard');
        const predictionsModule = require('./predictions');
        const freshPredictions = predictionsModule.getPredictionsFromFile();
        const leaderboard = leaderboardModule.calculateLeaderboard(freshPredictions, oscarWinners);
        
        console.log('Emitting winners update with leaderboard:', leaderboard.length, 'entries');
        
        // Emit the 'winnersUpdated' event with the fresh leaderboard data
        io.emit('winnersUpdated', { 
            winners: {...oscarWinners}, // Send a copy of the winners object
            leaderboard: leaderboard // Send the fresh leaderboard
        });
    }
};

router.post('/set-winner', (req, res) => {
    const winners = req.body;

    if (!winners || typeof winners !== 'object' || Object.keys(winners).length === 0) {
        return res.status(400).json({ message: 'Invalid winner data provided.' });
    }

    // We don't clear existing winners anymore, just update or add new ones
    for (const category in winners) {
        oscarWinners[category] = winners[category]; // Set winners from the request body
    }
    
    // Emit socket.io event to update clients
    emitWinnersUpdate(req);
    
    res.json({ message: 'Winner set successfully!', winners: oscarWinners });
});

// Route to clear a specific winner
router.delete('/winner/:category', (req, res) => {
    const category = req.params.category;
    
    if (oscarWinners[category]) {
        delete oscarWinners[category];
        
        // Emit socket.io event to update clients
        emitWinnersUpdate(req);
        
        res.json({ message: `Winner for ${category} removed successfully`, winners: oscarWinners });
    } else {
        res.status(404).json({ message: `No winner found for category ${category}` });
    }
});

// Route to clear all winners
router.delete('/winners', (req, res) => {
    Object.keys(oscarWinners).forEach(key => delete oscarWinners[key]);
    
    // Emit socket.io event to update clients
    emitWinnersUpdate(req);
    
    res.json({ message: 'All winners cleared successfully', winners: oscarWinners });
});

router.get('/winners', (req, res) => {
    res.json(oscarWinners); // Admin view of winners
});

// Get all game settings
router.get('/settings', (req, res) => {
    res.json(gameSettings);
});

// Update a specific game setting
router.post('/settings', (req, res) => {
    const updatedSettings = req.body;
    
    if (!updatedSettings || typeof updatedSettings !== 'object') {
        return res.status(400).json({ message: 'Invalid settings data provided.' });
    }
    
    // Update settings
    for (const key in updatedSettings) {
        gameSettings[key] = updatedSettings[key];
    }
    
    res.json({ 
        message: 'Settings updated successfully!', 
        settings: gameSettings 
    });
});

// Lock/unlock predictions - convenience endpoint
router.post('/settings/toggle-editing', (req, res) => {
    const { allowEditing } = req.body;
    
    if (typeof allowEditing !== 'boolean') {
        return res.status(400).json({ message: 'Invalid allowEditing value. Must be a boolean.' });
    }
    
    gameSettings.allowEditing = allowEditing;
    
    res.json({ 
        message: `Prediction editing is now ${allowEditing ? 'allowed' : 'disabled'}`,
        settings: gameSettings
    });
});

// Lock the entire game (no more submissions allowed)
router.post('/settings/toggle-lock', (req, res) => {
    const { isLocked } = req.body;
    
    if (typeof isLocked !== 'boolean') {
        return res.status(400).json({ message: 'Invalid isLocked value. Must be a boolean.' });
    }
    
    gameSettings.isLocked = isLocked;
    
    res.json({ 
        message: `The game is now ${isLocked ? 'locked' : 'unlocked'}`,
        settings: gameSettings
    });
});

router.get('/leaderboard', (req, res) => {
    const leaderboardModule = require('./leaderboard');
    const predictionsModule = require('./predictions');
    
    // Get fresh predictions from the file
    const freshPredictions = predictionsModule.getPredictionsFromFile();
    
    const leaderboard = leaderboardModule.calculateLeaderboard(
        freshPredictions, 
        oscarWinners
    );
    
    // Also emit leaderboard update to all clients
    const io = req.app.get('io');
    if (io) {
        io.emit('winnersUpdated', { 
            winners: {...oscarWinners},
            leaderboard: leaderboard
        });
    }
    
    res.json(leaderboard);
});

module.exports = router;