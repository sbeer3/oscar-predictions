const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const winnerModule = require('../models/winners');
const gameSettings = winnerModule.settings;

const predictionsFilePath = path.join(__dirname, '../data/predictions.json');

// Helper function to read predictions from file
function getPredictionsFromFile() {
    try {
        if (fs.existsSync(predictionsFilePath)) {
            const rawData = fs.readFileSync(predictionsFilePath);
            return JSON.parse(rawData);
        }
        return {};
    } catch (error) {
        console.error('Error reading predictions file:', error);
        return {};
    }
}

// Helper function to save predictions to file
function savePredictionsToFile(predictions) {
    try {
        // Make sure data directory exists
        const dir = path.dirname(predictionsFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const jsonData = JSON.stringify(predictions, null, 2);
        fs.writeFileSync(predictionsFilePath, jsonData);
    } catch (error) {
        console.error('Error saving predictions file:', error);
    }
}

// Load predictions initially
let userPredictions = getPredictionsFromFile();
let nextUserId = Object.keys(userPredictions).length > 0 ? 
    Math.max(...Object.keys(userPredictions).map(id => parseInt(id.split('-')[1]))) + 1 : 1;

// Submit new predictions
router.post('/', (req, res) => {
    const { userName, predictions } = req.body;

    // Check if game is locked
    if (gameSettings.isLocked) {
        return res.status(403).json({ 
            message: 'Predictions are locked. No new submissions allowed at this time.',
            isLocked: true
        });
    }

    if (!userName || !predictions || typeof predictions !== 'object') {
        return res.status(400).json({ message: 'Invalid request data.' });
    }

    // Check if user already exists
    const existingUserIds = Object.keys(userPredictions).filter(
        userId => userPredictions[userId].userName === userName
    );

    // If the user exists, either update or reject based on settings
    if (existingUserIds.length > 0) {
        // If editing is not allowed, reject the update
        if (!gameSettings.allowEditing) {
            return res.status(403).json({ 
                message: 'Editing predictions is currently disabled. Your previous predictions remain unchanged.',
                allowEditing: false
            });
        }
        
        // Update existing user's predictions
        const userId = existingUserIds[0]; // Use the first user ID found (there should only be one)
        userPredictions[userId].predictions = predictions;
        savePredictionsToFile(userPredictions);
        
        return res.status(200).json({ 
            message: 'Predictions updated successfully!', 
            userId: userId,
            isUpdate: true
        });
    }

    // Create new user if they don't exist
    const userId = `user-${nextUserId++}`;
    userPredictions[userId] = { userName, predictions };
    savePredictionsToFile(userPredictions);

    res.status(201).json({ 
        message: 'Predictions submitted successfully!', 
        userId: userId,
        isUpdate: false
    });
});

// Get game settings - public endpoint
router.get('/settings', (req, res) => {
    res.json({
        allowEditing: gameSettings.allowEditing,
        isLocked: gameSettings.isLocked
    });
});

// Get user's predictions by username
router.get('/user/:username', (req, res) => {
    const username = req.params.username;
    
    // Refresh predictions from file
    userPredictions = getPredictionsFromFile();
    
    const userEntry = Object.values(userPredictions).find(
        entry => entry.userName === username
    );
    
    if (!userEntry) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userEntry);
});

// Get all predictions
router.get('/', (req, res) => {
    // Refresh predictions from file to ensure latest data
    userPredictions = getPredictionsFromFile();
    res.json(userPredictions);
});

// Get all usernames
router.get('/usernames', (req, res) => {
    // Refresh predictions from file to ensure latest data
    userPredictions = getPredictionsFromFile();
    const usernames = Object.values(userPredictions)
                        .map(prediction => prediction.userName);
    res.json(usernames);
});

// Delete user's predictions by username (for admin)
router.delete('/user/:username', (req, res) => {
    const usernameToDelete = req.params.username;
    
    // Refresh predictions from file
    userPredictions = getPredictionsFromFile();
    
    // Find the user ID(s) matching the username
    const userIdsToDelete = Object.keys(userPredictions).filter(
        userId => userPredictions[userId].userName === usernameToDelete
    );
    
    if (userIdsToDelete.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove the user predictions
    userIdsToDelete.forEach(userId => {
        delete userPredictions[userId];
    });
    
    // Save updated predictions
    savePredictionsToFile(userPredictions);
    
    res.json({ 
        message: `Successfully deleted predictions for ${usernameToDelete}`,
        deletedCount: userIdsToDelete.length
    });
});

module.exports = {
    router,
    userPredictions, // Export for use in other modules like leaderboard
    getPredictionsFromFile // Export this function for refreshing data
};