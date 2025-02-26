import React from 'react';

function AdminPanel({ categories, onSetWinners, winnersList }) {
    const [winnersInput, setWinnersInput] = React.useState({});
    const [adminMessages, setAdminMessages] = React.useState([]);

    const handleInputChange = (categoryName, value) => {
        setWinnersInput(prevInputs => ({
            ...prevInputs,
            [categoryName]: value,
        }));
    };

    const handleSetWinners = async () => {
        try {
            const response = await fetch('/api/admin/set-winner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(winnersInput),
            });
            const data = await response.json();
            setAdminMessages([data.message]); // Update admin messages
            onSetWinners(); // Callback to refresh winners and leaderboard in parent
        } catch (error) {
            setAdminMessages(['Error setting winners: ' + error.message]);
            console.error('Error setting winners:', error);
        }
    };

    return (
        <div id="admin-section">
            <h2>Admin Panel</h2>
            <div id="admin-set-winners">
                <h3>Set Winners</h3>
                <div id="admin-winners-input-fields">
                    {categories && Object.keys(categories).map(categoryName => (
                        <div key={categoryName} className="admin-input-group">
                            <label htmlFor={`winner-input-${categoryNameToId(categoryName)}`}>
                                Winner for {categoryName}:
                            </label>
                            <input
                                type="text"
                                id={`winner-input-${categoryNameToId(categoryName)}`}
                                name={categoryNameToId(categoryName)}
                                onChange={(e) => handleInputChange(categoryName, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                <button id="set-winners-button" onClick={handleSetWinners}>Set Winners</button>
                <ul id="admin-messages">
                    {adminMessages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            </div>

            <div id="admin-view-winners">
                <h3>Current Winners</h3>
                <ul id="admin-winners-list">
                    {winnersList && Object.keys(winnersList).map(category => (
                        <li key={category}>{category}: {winnersList[category]}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function categoryNameToId(categoryName) {
    return categoryName.replace(/\s+/g, '-').toLowerCase();
}

export default AdminPanel;