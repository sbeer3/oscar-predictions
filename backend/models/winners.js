// backend/models/winners.js
const fs = require('fs');
const path = require('path');

// Path to the file where winners and settings data will be stored
const winnersFilePath = path.join(__dirname, '../data/winners.json');
const settingsFilePath = path.join(__dirname, '../data/settings.json');

// Initialize winners object and settings
let oscarWinners = {};
let gameSettings = { 
    allowEditing: true, // By default, users can edit their predictions
    isLocked: false // By default, the game is not locked (predictions are open)
};

// Try to load winners from file if it exists
try {
    if (fs.existsSync(winnersFilePath)) {
        const winnersData = fs.readFileSync(winnersFilePath, 'utf8');
        oscarWinners = JSON.parse(winnersData);
        console.log('Winners loaded from file:', winnersFilePath);
    } else {
        console.log('Winners file does not exist, using empty object');
    }
} catch (error) {
    console.error('Error loading winners file:', error);
}

// Try to load settings from file if it exists
try {
    if (fs.existsSync(settingsFilePath)) {
        const settingsData = fs.readFileSync(settingsFilePath, 'utf8');
        gameSettings = { ...gameSettings, ...JSON.parse(settingsData) };
        console.log('Settings loaded from file:', settingsFilePath);
    } else {
        console.log('Settings file does not exist, using default settings');
    }
} catch (error) {
    console.error('Error loading settings file:', error);
}

// Function to save winners to file
const saveWinners = () => {
    try {
        // Make sure the directory exists
        const dir = path.dirname(winnersFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write the winners data to the file
        fs.writeFileSync(winnersFilePath, JSON.stringify(oscarWinners, null, 2));
        console.log('Winners saved to file:', winnersFilePath);
    } catch (error) {
        console.error('Error saving winners file:', error);
    }
};

// Function to save settings to file
const saveSettings = () => {
    try {
        // Make sure the directory exists
        const dir = path.dirname(settingsFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write the settings data to the file
        fs.writeFileSync(settingsFilePath, JSON.stringify(gameSettings, null, 2));
        console.log('Settings saved to file:', settingsFilePath);
    } catch (error) {
        console.error('Error saving settings file:', error);
    }
};

// Create a proxy to automatically save winners when modified
const winnersProxy = new Proxy(oscarWinners, {
    set: function(target, property, value) {
        target[property] = value;
        saveWinners();
        return true;
    },
    deleteProperty: function(target, property) {
        delete target[property];
        saveWinners();
        return true;
    }
});

// Create a settings proxy to automatically save settings when modified
const settingsProxy = new Proxy(gameSettings, {
    set: function(target, property, value) {
        target[property] = value;
        saveSettings();
        return true;
    }
});

module.exports = {
    winners: winnersProxy,
    settings: settingsProxy
};