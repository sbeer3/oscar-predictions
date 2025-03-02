import React, { useState, useEffect, useCallback } from 'react';
import NameInputSection from './components/NameInputSection';
import PredictionForm from './components/PredictionForm';
import LeaderboardSection from './components/LeaderboardSection';
import AdminPanel from './components/AdminPanel';
import Cookies from 'js-cookie'; // Import js-cookie
import { io } from 'socket.io-client';

function App() {
    const [categories, setCategories] = useState(null);
    const [currentUserName, setCurrentUserName] = useState(null);
    const [showPredictionForm, setShowPredictionForm] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showAdminSection, setShowAdminSection] = useState(false);
    const [winners, setWinners] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState(null);
    const [adminMessages, setAdminMessages] = useState([]);
    const [showGreetingSection, setShowGreetingSection] = useState(false); // New state for greeting section
    const [areNamesLoaded, setAreNamesLoaded] = useState(false); // Loading state for images
    const [previousPredictions, setPreviousPredictions] = useState(null); // Store user's existing predictions
    const [isEditingPredictions, setIsEditingPredictions] = useState(false); // Flag to indicate when editing
    const [gameSettings, setGameSettings] = useState({
        allowEditing: true,
        isLocked: false
    });
    const [countdown, setCountdown] = useState(""); // State for countdown timer
    const [socket, setSocket] = useState(null); // Socket.io connection

    // useCallback for fetchCategories to prevent unnecessary re-renders
    const fetchCategories = useCallback(async () => {
        try {
            fetch(`/api/categories`) 
            .then(response => response.json())
            .then(data => {
                setCategories(data);
            })
            .catch(error => console.error('Error fetching categories:', error));
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories({});
        }
    }, []);

    useEffect(() => {
        if (currentUserName) {
            fetchCategories();
        }
    }, [currentUserName, fetchCategories]);

    // Fetch game settings
    const fetchGameSettings = useCallback(async () => {
        try {
            const response = await fetch(`/api/predictions/settings`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setGameSettings(data);
        } catch (error) {
            console.error('Error fetching game settings:', error);
        }
    }, []);
    
    useEffect(() => {
        fetchLeaderboard();
        fetchWinners();
        fetchGameSettings();

        const savedUserName = Cookies.get('userName');
        if (savedUserName) {
            setCurrentUserName(savedUserName);
            // Now, after setting username from cookie, check if they have predictions
            checkIfUserHasPredictions(savedUserName);
        }
        
        // Initialize socket connection
        const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
        const newSocket = io(socketUrl);
        setSocket(newSocket);
        
        // Setup event listeners
        newSocket.on('winnersUpdated', (data) => {
            console.log('Received winners update via socket.io', data);
            if (data.winners) {
                setWinners(data.winners);
            }
            if (data.leaderboard) {
                setLeaderboardData(data.leaderboard);
            }
        });
        
        // Clean up socket connection when component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, [fetchGameSettings]);

    const handleStartPrediction = async () => {
        setShowPredictionForm(true);
        setShowGreetingSection(false); // Hide greeting when starting predictions
        setShowLeaderboard(false);     // Hide leaderboard too
        
        // If user already has predictions, fetch them to pre-populate the form
        try {
            const response = await fetch(`/api/predictions/user/${currentUserName}`);
            if (response.ok) {
                const data = await response.json();
                // Store the user's existing predictions in state to pass to PredictionForm
                setPreviousPredictions(data.predictions);
            }
        } catch (error) {
            console.error('Error fetching user predictions:', error);
        }
    };

    const handleViewLeaderboardFromGreeting = () => {
        setShowLeaderboard(true);
        setShowGreetingSection(false); // Hide greeting when viewing leaderboard
        setShowPredictionForm(false);     // Hide prediction form
    };

    const checkIfUserHasPredictions = async (userName) => {
        try {
            // First get list of usernames to check if user exists
            const response = await fetch(`/api/predictions/usernames`);
            const existingUsernames = await response.json();
            
            const nameExistsInPredictions = existingUsernames.includes(userName);
            
            if (nameExistsInPredictions) {
                // If name exists, fetch their predictions for potential editing
                const userResponse = await fetch(`/api/predictions/user/${userName}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setPreviousPredictions(userData.predictions);
                    setIsEditingPredictions(true); // Set flag that user is editing existing predictions
                }
                
                // Show leaderboard by default, but greeting can be shown if editing is allowed
                if (gameSettings.allowEditing) {
                    setShowLeaderboard(false);
                    setShowGreetingSection(true);
                } else {
                    setShowLeaderboard(true);
                    setShowGreetingSection(false);
                }
                setShowPredictionForm(false);
            } else {
                // If name doesn't exist in predictions, show greeting to make new prediction
                setShowLeaderboard(false);
                setShowGreetingSection(true);
                setShowPredictionForm(false);
                setIsEditingPredictions(false);
                setPreviousPredictions(null);
            }
        } catch (error) {
            console.error('Error checking user predictions:', error);
            // In case of error, default to showing greeting section
            setShowLeaderboard(false);
            setShowGreetingSection(true);
            setShowPredictionForm(false);
        }
    };
    const handleNameSubmit = (userName) => {
        setCurrentUserName(userName);
        Cookies.set('userName', userName, { expires: 7 });
        checkIfUserHasPredictions(userName); // Check predictions immediately after name submit
    };
    const handleLogout = () => {
        Cookies.remove('userName');
        setCurrentUserName(null);
        setShowLeaderboard(false);
        setShowPredictionForm(false);
        setShowGreetingSection(false); // Hide greeting on logout too
    };

    const handlePredictionSubmit = async (predictions) => {
        try {
            // Check first if game is locked or editing is disabled
            if (gameSettings.isLocked) {
                alert('Predictions are locked. No new submissions are allowed at this time.');
                return;
            }
            
            const response = await fetch(`/api/predictions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName: currentUserName, predictions }),
            });
            
            const data = await response.json();
            
            // If forbidden due to editing being disabled
            if (response.status === 403) {
                alert(data.message);
                return;
            }
            
            alert(data.message);
            setShowPredictionForm(false);
            setShowLeaderboard(true);
            fetchLeaderboard(); // Refresh leaderboard after submission
        } catch (error) {
            console.error('Error submitting predictions:', error);
            alert('Error submitting predictions. Please try again.');
        }
    };

    const fetchLeaderboard = async () => {
        try {
            fetch(`/api/leaderboard`)
            .then(response => response.json())
            .then(leaderboardData => {
                setLeaderboardData(leaderboardData);
            })
            .catch(error => console.error('Error fetching leaderboard:', error));
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    const fetchWinners = async () => {
        try {
            const response = await fetch(`/api/admin/winners`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setWinners(data);
        } catch (error) {
            console.error('Error fetching winners list:', error);
        }
    };

    const handleSetWinnersAdmin = async () => {
        // No need to fetch, socket will update us
        // We'll keep this function in case we need to manually refresh
        console.log("Winner set by admin, waiting for socket update");
    };


    // Check if user is admin and show admin panel
    useEffect(() => {
        if (currentUserName === "Admin") {
            setShowAdminSection(true);
            setShowLeaderboard(false);
            setShowPredictionForm(false);
            setShowGreetingSection(false);
        } else {
            setShowAdminSection(false);
        }
    }, [currentUserName]);
    
    const toggleAdminPanel = useCallback((event) => {
        if (event.key === 'a') {
            setShowAdminSection(prevShowAdminPanel => !prevShowAdminPanel);
            setShowLeaderboard(false); // Hide leaderboard when showing admin
            setShowPredictionForm(false); // Hide prediction form too for clarity
        }
    }, []); // No dependencies - toggleAdminPanel doesn't depend on any state in the component


    useEffect(() => {
        document.addEventListener('keypress', toggleAdminPanel); // Attach event listener on mount

        return () => {
            document.removeEventListener('keypress', toggleAdminPanel); // Detach on unmount (cleanup)
        };
    }, [toggleAdminPanel]); // Dependency array includes toggleAdminPanel (for useCallback)

    // Countdown logic
    useEffect(() => {
        // Set the target date for the Academy Awards in Mountain Standard Time (MST)
        // 6:00 PM MST on March 2, 2025 = 18:00:00 in 24-hour format
        const targetDate = new Date('2025-03-02T18:00:00-07:00'); // -07:00 is MST timezone offset
        const interval = setInterval(() => {
            const now = new Date();
            const timeRemaining = targetDate - now;

            if (timeRemaining <= 0) {
                clearInterval(interval);
                setCountdown("The Academy Awards have started!");
                
                // Automatically lock predictions when timer expires
                fetch('/api/admin/settings/toggle-lock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ isLocked: true }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Game locked:', data);
                    // Update local settings
                    setGameSettings(prevSettings => ({...prevSettings, isLocked: true}));
                })
                .catch(error => console.error('Error locking game:', error));
            } else {
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    const [showNameInput, setShowNameInput] = useState(true); // Control visibility of name input

    return (
        <div className="container">
            <div className="countdown-timer">
                <h2>Countdown to the Academy Awards (MST): {countdown}</h2>
            </div>
            {!currentUserName ? (
                <>
                    <NameInputSection onNameSubmit={handleNameSubmit} />
                </>
            ) : showLeaderboard ? (
                <>
                    <div className="header">
                        <h1>Oscar Predictions</h1>
                        <div className="nav-buttons">
                            <button onClick={handleLogout} className="logout-button">Change User</button>
                        </div>
                    </div>
                    <LeaderboardSection leaderboardData={leaderboardData} onLogout={handleLogout} />
                </>
            ) : showGreetingSection ? (
                <>
                    <div className="header">
                        <h1>Oscar Predictions</h1>
                    </div>
                    <div id="user-greeting-section">
                        <div className="greeting-content">
                            <div className="oscar-icon-small"></div>
                            <h2>Welcome, {currentUserName}!</h2>
                            
                            {isEditingPredictions ? (
                                <p className="greeting-text editing-mode">
                                    You already have predictions submitted. You can edit them if you'd like.
                                </p>
                            ) : (
                                <p className="greeting-text">
                                    You're all set to make your predictions for the 97th Academy Awards.
                                </p>
                            )}
                            
                            <div className="action-buttons">
                                <button 
                                    onClick={handleStartPrediction} 
                                    className={`start-button ${isEditingPredictions ? 'edit-mode' : ''}`}
                                    disabled={isEditingPredictions && !gameSettings.allowEditing}
                                >
                                    <span className="button-icon">{isEditingPredictions ? '✏️' : '🎬'}</span>
                                    {isEditingPredictions 
                                        ? (gameSettings.allowEditing ? 'Edit My Predictions' : 'Predictions Locked') 
                                        : 'Make My Predictions'
                                    }
                                </button>
                                <button onClick={handleViewLeaderboardFromGreeting} className="leaderboard-button">
                                    <span className="button-icon">🏆</span>
                                    View Leaderboard
                                </button>
                            </div>
                            
                            {!gameSettings.allowEditing && isEditingPredictions && (
                                <div className="editing-disabled-message">
                                    Editing predictions is currently disabled by the admin.
                                </div>
                            )}
                            
                            <button onClick={handleLogout} className="logout-button-small">
                                Change User
                            </button>
                        </div>
                    </div>
                </>
            ) : showPredictionForm && categories ? (
                <>
                    <div className="header">
                        <h1>Oscar Predictions</h1>
                        <div className="user-info">
                            <span>
                                {isEditingPredictions ? 'Editing' : 'Making'} predictions as: <strong>{currentUserName}</strong>
                            </span>
                            <button onClick={handleLogout} className="logout-button">Change User</button>
                        </div>
                    </div>
                    <PredictionForm 
                        categories={categories} 
                        onSubmitPredictions={handlePredictionSubmit}
                        initialPredictions={previousPredictions}
                        isEditing={isEditingPredictions}
                    />
                </>
            ) : null}


            {showAdminSection && (
                <AdminPanel
                    categories={categories}
                    winners={winners}
                    gameSettings={gameSettings}
                    onSetWinners={handleSetWinnersAdmin}
                    onUpdateSettings={(updatedSettings) => {
                        setGameSettings(prevSettings => ({...prevSettings, ...updatedSettings}));
                        fetchGameSettings(); // Refresh settings from server
                    }}
                />
            )}
        </div>
    );
}

export default App;