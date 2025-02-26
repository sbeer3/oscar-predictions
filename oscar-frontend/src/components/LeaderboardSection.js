import React from 'react';

function LeaderboardSection({ leaderboardData }) {
    return (
        <div id="leaderboard-section">
            <h2>Leaderboard</h2>
            <ul id="leaderboard-list">
                {leaderboardData && leaderboardData.map((entry, index) => (
                    <li key={index}>{entry.userName}: {entry.score} points</li>
                ))}
            </ul>
        </div>
    );
}

export default LeaderboardSection;