const express = require('express');
const router = express.Router();
const predictionsModule = require('./predictions');
const winnerModule = require('../models/winners');
const oscarWinners = winnerModule.winners;  // Use the winners proxy object

router.get('/', (req, res) => {
    // Get fresh predictions data using the exported function
    const userPredictions = predictionsModule.getPredictionsFromFile();
    const leaderboard = calculateLeaderboard(userPredictions, oscarWinners);
    res.json(leaderboard);
});

function calculateLeaderboard(predictions, winners) {
    console.log("Backend: calculateLeaderboard function called!");
    
    // Map of category name variations to standardized names
    const categoryMap = {
        // User-entered category names to standardized versions
        "Best Director": "Directing",
        "Director": "Directing",
        "Directing": "Directing",
        
        "Best Actor": "Best Actor",
        "Actor": "Best Actor",

        "Best Actress": "Best Actress", 
        "Actress": "Best Actress",
        
        "Best Supporting Actor": "Supporting Actor",
        "Supporting Actor": "Supporting Actor",
        
        "Best Supporting Actress": "Supporting Actress",
        "Supporting Actress": "Supporting Actress",
        
        "Best Picture": "Best Picture",
        "Picture": "Best Picture",
        
        "Best Animated Feature": "Animated Feature",
        "Best Animated Feature Film": "Animated Feature",
        "Animated Feature": "Animated Feature",
        "Animated Feature Film": "Animated Feature",
        
        "Best International Feature": "International Feature",
        "Best International Feature Film": "International Feature",
        "International Feature": "International Feature",
        "International Feature Film": "International Feature",
        
        "Best Documentary Feature": "Documentary (Feature)",
        "Best Documentary": "Documentary (Feature)",
        "Documentary Feature": "Documentary (Feature)",
        "Documentary (Feature)": "Documentary (Feature)",
        
        "Best Documentary Short": "Documentary (Short)",
        "Best Documentary Short Film": "Documentary (Short)",
        "Documentary Short": "Documentary (Short)",
        "Documentary (Short)": "Documentary (Short)",
        "Documentary Short Film": "Documentary (Short)",
        
        "Best Live Action Short": "Short Film (Live Action)",
        "Best Live Action Short Film": "Short Film (Live Action)",
        "Live Action Short": "Short Film (Live Action)",
        "Short Film (Live Action)": "Short Film (Live Action)",
        
        "Best Animated Short": "Short Film (Animated)",
        "Best Animated Short Film": "Short Film (Animated)",
        "Animated Short": "Short Film (Animated)",
        "Short Film (Animated)": "Short Film (Animated)",
        "Animated Short Film": "Short Film (Animated)",
        
        "Best Original Screenplay": "Screenplay (Original)",
        "Original Screenplay": "Screenplay (Original)",
        "Screenplay (Original)": "Screenplay (Original)",
        
        "Best Adapted Screenplay": "Screenplay (Adapted)",
        "Adapted Screenplay": "Screenplay (Adapted)",
        "Screenplay (Adapted)": "Screenplay (Adapted)",
        
        "Best Cinematography": "Cinematography",
        "Cinematography": "Cinematography",
        
        "Best Film Editing": "Film Editing",
        "Film Editing": "Film Editing",
        "Editing": "Film Editing",
        
        "Best Production Design": "Production Design",
        "Production Design": "Production Design",
        
        "Best Costume Design": "Costume Design",
        "Costume Design": "Costume Design",
        
        "Best Makeup and Hairstyling": "Makeup and Hairstyling",
        "Makeup and Hairstyling": "Makeup and Hairstyling",
        
        "Best Sound": "Best Sound",
        "Sound": "Best Sound",
        
        "Best Visual Effects": "Visual Effects",
        "Visual Effects": "Visual Effects",
        
        "Best Original Score": "Music (Original Score)",
        "Original Score": "Music (Original Score)",
        "Music (Original Score)": "Music (Original Score)",
        
        "Best Original Song": "Music (Original Song)",
        "Original Song": "Music (Original Song)",
        "Music (Original Song)": "Music (Original Song)"
    };
    
    // Helper function to normalize category names
    const normalizeCategory = (category) => {
        return categoryMap[category] || category;
    };
    
    // Helper function to normalize nominee names (case insensitive comparison)
    const normalizeNominee = (nominee) => {
        return nominee ? nominee.toUpperCase().trim() : '';
    };
    
    const leaderboard = [];
    for (const userId in predictions) {
        const userData = predictions[userId];

        if (!userData || !userData.predictions) {
            console.log("Backend: WARNING! userData or userData.predictions is undefined for userId:", userId, userData);
            continue;
        }

        let score = 0;
        const correctPredictions = []; // Track which categories were correct for detailed display
        
        for (const category in userData.predictions) {
            const normalizedCategory = normalizeCategory(category);
            const userPrediction = normalizeNominee(userData.predictions[category]);
            
            // Find if there's a winner set for this category
            for (const winnerCategory in winners) {
                const normalizedWinnerCategory = normalizeCategory(winnerCategory);
                
                if (normalizedCategory === normalizedWinnerCategory) {
                    const winnerNominee = normalizeNominee(winners[winnerCategory]);
                    
                    if (userPrediction === winnerNominee) {
                        score++;
                        correctPredictions.push({
                            category: winnerCategory,
                            prediction: winners[winnerCategory]
                        });
                    }
                }
            }
        }
        
        leaderboard.push({ 
            userName: userData.userName, 
            score,
            userId, // Include userId for reference
            correctPredictions // Include details of correct predictions
        });
    }
    
    // Sort by score in descending order
    leaderboard.sort((a, b) => b.score - a.score);
    
    return leaderboard;
}

module.exports = {
    router,
    calculateLeaderboard // Export for use in other modules
};