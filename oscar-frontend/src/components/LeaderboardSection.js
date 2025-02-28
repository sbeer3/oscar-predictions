import React, { useState } from 'react';

function LeaderboardSection({ leaderboardData, onLogout })  {
    const [expandedUser, setExpandedUser] = useState(null);
    
    // Toggle detailed predictions view for a user
    const toggleUserDetails = (userName) => {
        if (expandedUser === userName) {
            setExpandedUser(null);
        } else {
            setExpandedUser(userName);
        }
    };
    
    // Calculate ranking (with ties)
    const calculateRanking = () => {
        if (!leaderboardData || leaderboardData.length === 0) return [];
        
        // Create ranking with position
        let currentRank = 1;
        let previousScore = leaderboardData[0].score;
        
        return leaderboardData.map((entry, index) => {
            // Handle ties - same score gets same rank
            if (index > 0 && entry.score < previousScore) {
                currentRank = index + 1; // New rank if score is lower than previous
            }
            previousScore = entry.score;
            
            return {
                ...entry,
                rank: currentRank
            };
        });
    };
    
    const rankedLeaderboard = calculateRanking();
    
    // Get medal emoji based on rank
    const getRankMedal = (rank) => {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `${rank}.`;
        }
    };
    
    return (
        <div id="leaderboard-section" style={{ display: leaderboardData ? 'block' : 'none' }}>
            <h2>Oscar Predictions Leaderboard</h2>
            
            {rankedLeaderboard.length === 0 ? (
                <div className="no-predictions">
                    <p>No predictions have been submitted yet!</p>
                </div>
            ) : (
                <div className="leaderboard-container">
                    <ul id="leaderboard-list">
                        {rankedLeaderboard.map(entry => (
                            <React.Fragment key={entry.userName}>
                                <li 
                                    className={`leaderboard-entry ${expandedUser === entry.userName ? 'expanded' : ''}`}
                                    onClick={() => toggleUserDetails(entry.userName)}
                                >
                                    <div className="rank-indicator">
                                        <span className="rank-medal">{getRankMedal(entry.rank)}</span>
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">{entry.userName}</span>
                                        <span className="score-badge">{entry.score} point{entry.score !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="toggle-icon">
                                        {entry.correctPredictions && entry.correctPredictions.length > 0 && (
                                            <span>{expandedUser === entry.userName ? '▼' : '▶'}</span>
                                        )}
                                    </div>
                                </li>
                                
                                {expandedUser === entry.userName && entry.correctPredictions && entry.correctPredictions.length > 0 && (
                                    <li className="prediction-details">
                                        <h4>Correct Predictions</h4>
                                        <ul className="correct-predictions-list">
                                            {entry.correctPredictions.map((prediction, idx) => (
                                                <li key={idx}>
                                                    <span className="category-name">{prediction.category}:</span> 
                                                    <span className="prediction-value">{prediction.prediction}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="leaderboard-footer">
                <button onClick={onLogout} className="logout-button">Change User</button>
            </div>
        </div>
    );
}

export default LeaderboardSection;