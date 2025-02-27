import React, { useState, useEffect, useCallback } from 'react';
import NameInputSection from './components/NameInputSection';
import PredictionForm from './components/PredictionForm';
import LeaderboardSection from './components/LeaderboardSection';
import AdminPanel from './components/AdminPanel';
import Cookies from 'js-cookie'; // Import js-cookie

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
    // useCallback for fetchCategories to prevent unnecessary re-renders
    const fetchCategories = useCallback(async () => {
        try {
            fetch('http://localhost:5000/api/categories') 
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

    useEffect(() => {
        fetchLeaderboard();
        fetchWinners();

        const savedUserName = Cookies.get('userName');
        if (savedUserName) {
            setCurrentUserName(savedUserName);
            // Now, after setting username from cookie, check if they have predictions
            checkIfUserHasPredictions(savedUserName);
        }
    }, []);

    const handleStartPrediction = () => {
        setShowPredictionForm(true);
        setShowGreetingSection(false); // Hide greeting when starting predictions
        setShowLeaderboard(false);      // Hide leaderboard too
    };

    const handleViewLeaderboardFromGreeting = () => {
        setShowLeaderboard(true);
        setShowGreetingSection(false); // Hide greeting when viewing leaderboard
        setShowPredictionForm(false);     // Hide prediction form
    };

    const checkIfUserHasPredictions = (userName) => {
        fetch('http://localhost:5000/api/predictions/usernames') // Use the same /api/usernames endpoint
            .then(response => response.json())
            .then(existingUsernames => {
                const nameExistsInPredictions = existingUsernames.includes(userName);
                if (nameExistsInPredictions) {
                    setShowLeaderboard(true); // If name IS in predictions, go to leaderboard
                    setShowGreetingSection(false);
                    setShowPredictionForm(false);
                } else {
                    setShowLeaderboard(false);
                    setShowGreetingSection(true); // If name is NOT in predictions, show greeting section
                    setShowPredictionForm(false);
                }
            })
            .catch(error => {
                console.error('Error checking user predictions:', error);
                // In case of error, default to showing greeting section (or handle error as needed)
                setShowLeaderboard(false);
                setShowGreetingSection(true);
                setShowPredictionForm(false);
            });
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
            const response = await fetch('http://localhost:5000/api/predictions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName: currentUserName, predictions }),
            });
            const data = await response.json();
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
            fetch('http://localhost:5000/api/leaderboard')
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
            // const response = await fetch('/api/admin/winners');
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // const data = await response.json();
            // setWinnersList(data);
        } catch (error) {
            console.error('Error fetching winners list:', error);
        }
    };

    const handleSetWinnersAdmin = async () => {
        await fetchWinners(); // Re-fetch winners list after setting winners (in AdminPanel component)
        fetchLeaderboard();    // Re-fetch leaderboard in case winner changes affected scores
    };


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


    const [showNameInput, setShowNameInput] = useState(true); // Control visibility of name input

    return (
        <div className="container">
            <h1>Oscar Predictions</h1>

            {!currentUserName ? (
                <NameInputSection onNameSubmit={handleNameSubmit} />
            ) : showLeaderboard ? (
                <LeaderboardSection leaderboardData={leaderboardData} onLogout={handleLogout} />
            ) : showGreetingSection ? ( // NEW: Check for showGreetingSection
                <div id="user-greeting-section">
                    <h2>Welcome, {currentUserName}!</h2>
                    <button onClick={handleStartPrediction}>Start Predicting</button>
                    <button onClick={handleViewLeaderboardFromGreeting}>View Leaderboard</button>
                    <button onClick={handleLogout}>Change Name/Logout</button>
                </div>
            ) : showPredictionForm && categories ? (
                <PredictionForm categories={categories} onSubmitPredictions={handlePredictionSubmit} />
            ) : null /* or handle other states if needed */}


            {showAdminSection && (
                <AdminPanel
                    categories={categories}
                    winners={winners}
                    onSetWinners={fetchWinners}
                    adminMessages={adminMessages}
                />
            )}
        </div>
    );
}

export default App;