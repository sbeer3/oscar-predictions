import React, { useState, useEffect, useCallback } from 'react';
import NameInputSection from './components/NameInputSection';
import PredictionForm from './components/PredictionForm';
import LeaderboardSection from './components/LeaderboardSection';
import AdminPanel from './components/AdminPanel';

function App() {
    const [currentUserName, setCurrentUserName] = useState('');
    const [categories, setCategories] = useState(null); // Initially null, loading state
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [winnersList, setWinnersList] = useState(null); // Winners data for Admin Panel
    const [showPredictionForm, setShowPredictionForm] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    // useCallback for fetchCategories to prevent unnecessary re-renders
    const fetchCategories = useCallback(async () => {
        try {
            fetch('http://localhost:5000/api/categories') 
            .then(response => response.json())
            .then(data => {
                setCategories(data);
            })
            .catch(error => console.error('Error fetching categories:', error));
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // const data = await response.json();
            // setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Handle error state, maybe setCategories to an empty object or display error message
            setCategories({}); // To avoid app breaking if fetch fails, but form will be empty
        }
    }, []);

    useEffect(() => {
        if (currentUserName) {
            fetchCategories(); // Fetch categories when name is submitted
        }
    }, [currentUserName, fetchCategories]); // Dependencies: currentUserName, fetchCategories

    useEffect(() => {
        fetchLeaderboard(); // Fetch leaderboard on initial load and when winners are set
        fetchWinners();     // Fetch winners list for admin panel on initial load and when winners are set
    }, []); // Fetch on component mount (empty dependency array)

    const handleNameSubmit = (userName) => {
        setCurrentUserName(userName);
        setShowNameInput(false);
        setShowPredictionForm(true);
        setShowLeaderboard(false);
        setShowAdminPanel(false);
    };

    const handlePredictionSubmit = async (predictions) => {
        try {
            const response = await fetch('/api/predictions', {
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
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // console.log(response)
            // const data = await response.json();
            // setLeaderboardData(data);
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
            setShowAdminPanel(prevShowAdminPanel => !prevShowAdminPanel);
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
            {showNameInput && <NameInputSection onNameSubmit={handleNameSubmit} />}
            {showPredictionForm && categories && (
                <PredictionForm categories={categories} onSubmitPredictions={handlePredictionSubmit} />
            )}
            {showLeaderboard && <LeaderboardSection leaderboardData={leaderboardData} />}
            {showAdminPanel && categories && (
                <AdminPanel
                    categories={categories}
                    onSetWinners={handleSetWinnersAdmin}
                    winnersList={winnersList}
                />
            )}
        </div>
    );
}

export default App;