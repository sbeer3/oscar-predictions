import React from 'react';

function LeaderboardSection({ leaderboardData, onLogout })  {
    return (
        <div id="leaderboard-section" style={{ display: leaderboardData ? 'block' : 'none' }}>
            <h2>Leaderboard</h2>
            <ul id="leaderboard-list">
                {leaderboardData && leaderboardData.map(entry => (
                    <li key={entry.userName}>{entry.userName}: {entry.score} points</li>
                ))}
            </ul>
            <button onClick={onLogout}>Change Name/Logout</button> {/* Logout Button */}
        </div>
    );
}

export default LeaderboardSection;