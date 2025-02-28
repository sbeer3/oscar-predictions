import React, { useState, useEffect } from 'react';

function AdminPanel({ categories, winners, gameSettings, onSetWinners, onUpdateSettings }) {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedNominee, setSelectedNominee] = useState('');
    const [nominees, setNominees] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);
    const [userPredictions, setUserPredictions] = useState([]);
    const [usernameToDelete, setUsernameToDelete] = useState('');
    const [activeTab, setActiveTab] = useState('winners'); // 'winners', 'users', or 'settings'

    // Load nominees for category dropdown
    useEffect(() => {
        if (selectedCategory && categories && categories[selectedCategory]) {
            setNominees(categories[selectedCategory]);
            setSelectedNominee(''); // Reset selected nominee when category changes
        }
    }, [selectedCategory, categories]);

    // Load user predictions for the user management tab
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUserPredictions();
        }
    }, [activeTab]);

    const fetchUserPredictions = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/predictions');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Get array of usernames from the predictions object
            const users = Object.values(data).map(entry => entry.userName);
            setUserPredictions(users);
        } catch (error) {
            console.error('Error fetching user predictions:', error);
            setAdminMessages(['Error fetching users: ' + error.message]);
        }
    };

    // Winner management handlers
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleNomineeChange = (e) => {
        setSelectedNominee(e.target.value);
    };

    const handleSetWinner = async () => {
        if (!selectedCategory || !selectedNominee) {
            setAdminMessages(['Please select both a category and a nominee']);
            return;
        }

        try {
            // Create winners object with the selected category and nominee
            const winnersInput = {
                [selectedCategory]: selectedNominee
            };

            const response = await fetch('http://localhost:5000/api/admin/set-winner', {
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

    // User prediction management handlers
    const handleUsernameToDeleteChange = (e) => {
        setUsernameToDelete(e.target.value);
    };

    const handleDeleteUser = async () => {
        if (!usernameToDelete) {
            setAdminMessages(['Please select a user to delete']);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/predictions/user/${usernameToDelete}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            setAdminMessages([data.message]);
            
            // Refresh the user list
            fetchUserPredictions();
            
            // Reset the selection
            setUsernameToDelete('');
        } catch (error) {
            setAdminMessages(['Error deleting user: ' + error.message]);
            console.error('Error deleting user:', error);
        }
    };

    // Helper for nominee display
    const getNomineeName = (nominee) => {
        if (typeof nominee === 'string') return nominee;
        if (nominee && nominee.nominee) return nominee.nominee;
        return 'Unknown';
    };

    return (
        <div id="admin-section">
            <h2>Admin Panel</h2>
            
            <div className="admin-tabs">
                <button 
                    className={activeTab === 'winners' ? 'active' : ''} 
                    onClick={() => setActiveTab('winners')}
                >
                    Manage Winners
                </button>
                <button 
                    className={activeTab === 'users' ? 'active' : ''} 
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
                <button 
                    className={activeTab === 'settings' ? 'active' : ''} 
                    onClick={() => setActiveTab('settings')}
                >
                    Game Settings
                </button>
            </div>
            
            {/* Winners Management Section */}
            {activeTab === 'winners' && (
                <>
                    <div id="admin-set-winners">
                        <h3>Set Winners</h3>
                        <div className="admin-input-group">
                            <label htmlFor="category-select">Category:</label>
                            <select 
                                id="category-select" 
                                value={selectedCategory} 
                                onChange={handleCategoryChange}
                            >
                                <option value="">-- Select Category --</option>
                                {categories && Object.keys(categories).map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-input-group">
                            <label htmlFor="nominee-select">Nominee:</label>
                            <select 
                                id="nominee-select" 
                                value={selectedNominee} 
                                onChange={handleNomineeChange}
                                disabled={!selectedCategory}
                            >
                                <option value="">-- Select Nominee --</option>
                                {nominees.map((nominee, index) => (
                                    <option key={index} value={getNomineeName(nominee)}>
                                        {getNomineeName(nominee)}
                                        {nominee.movie ? ` (${nominee.movie})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button id="set-winners-button" onClick={handleSetWinner}>Set Winner</button>
                    </div>

                    <div id="admin-view-winners">
                        <h3>Current Winners</h3>
                        {winners && Object.keys(winners).length > 0 ? (
                            <ul id="admin-winners-list">
                                {Object.keys(winners).map(category => (
                                    <li key={category}>
                                        <span className="category">{category}</span>
                                        <span className="winner">{winners[category]}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No winners set yet</p>
                        )}
                    </div>
                </>
            )}
            
            {/* User Management Section */}
            {activeTab === 'users' && (
                <div id="admin-manage-users">
                    <h3>Delete User Predictions</h3>
                    <div className="admin-input-group">
                        <label htmlFor="username-select">Select User:</label>
                        <select 
                            id="username-select" 
                            value={usernameToDelete} 
                            onChange={handleUsernameToDeleteChange}
                        >
                            <option value="">-- Select User --</option>
                            {userPredictions.map((username, index) => (
                                <option key={index} value={username}>
                                    {username}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        id="delete-user-button" 
                        onClick={handleDeleteUser}
                        disabled={!usernameToDelete}
                        className="danger-button"
                    >
                        Delete User's Predictions
                    </button>
                    
                    <div id="user-list">
                        <h4>Current Users ({userPredictions.length})</h4>
                        {userPredictions.length > 0 ? (
                            <ul>
                                {userPredictions.map((username, index) => (
                                    <li key={index}>
                                        <span className="user-name">{username}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">No users have submitted predictions yet</p>
                        )}
                    </div>
                </div>
            )}
            
            {/* Game Settings Section */}
            {activeTab === 'settings' && (
                <div id="admin-game-settings">
                    <h3>Game Settings</h3>
                    
                    <div className="settings-card">
                        <div className="setting-item">
                            <div className="setting-header">
                                <h4>Allow Editing Predictions</h4>
                                <p className="setting-description">
                                    When enabled, users can edit their predictions after submission. 
                                    When disabled, predictions become final once submitted.
                                </p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={gameSettings.allowEditing}
                                        onChange={() => handleToggleSetting('allowEditing')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                                <span className="toggle-status">
                                    {gameSettings.allowEditing ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="setting-divider"></div>
                        
                        <div className="setting-item">
                            <div className="setting-header">
                                <h4>Lock Predictions</h4>
                                <p className="setting-description">
                                    When enabled, no new predictions can be submitted or edited.
                                    Use this to lock the game before the ceremony begins.
                                </p>
                            </div>
                            <div className="setting-control">
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={gameSettings.isLocked}
                                        onChange={() => handleToggleSetting('isLocked')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                                <span className={`toggle-status ${gameSettings.isLocked ? 'locked' : 'unlocked'}`}>
                                    {gameSettings.isLocked ? 'Locked' : 'Unlocked'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shared message display section */}
            {adminMessages.length > 0 && (
                <div id="admin-messages">
                    {adminMessages.map((message, index) => (
                        <p key={index}>{message}</p>
                    ))}
                </div>
            )}
        </div>
    );
    
    // Handler for toggling game settings
    async function handleToggleSetting(settingName) {
        try {
            let settingValue;
            
            if (settingName === 'allowEditing') {
                settingValue = !gameSettings.allowEditing;
                
                const response = await fetch('http://localhost:5000/api/admin/settings/toggle-editing', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ allowEditing: settingValue }),
                });
                
                const data = await response.json();
                setAdminMessages([data.message]);
                
                // Update parent component's state
                if (onUpdateSettings) {
                    onUpdateSettings({ allowEditing: settingValue });
                }
                
            } else if (settingName === 'isLocked') {
                settingValue = !gameSettings.isLocked;
                
                const response = await fetch('http://localhost:5000/api/admin/settings/toggle-lock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isLocked: settingValue }),
                });
                
                const data = await response.json();
                setAdminMessages([data.message]);
                
                // Update parent component's state
                if (onUpdateSettings) {
                    onUpdateSettings({ isLocked: settingValue });
                }
            }
            
        } catch (error) {
            setAdminMessages(['Error updating settings: ' + error.message]);
            console.error('Error updating settings:', error);
        }
    }
}

export default AdminPanel;