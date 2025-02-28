import React, { useState } from 'react';

function NameInputSection({ onNameSubmit }) {
    const [userName, setUserName] = useState('');
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (userName.trim() !== "") {
            setIsFormSubmitted(true);
            // Using setTimeout to show the welcome animation before proceeding
            setTimeout(() => {
                onNameSubmit(userName);
            }, 800);
        } else {
            alert("Please enter your name to continue.");
        }
    };

    return (
        <div id="name-input-section" className={isFormSubmitted ? "submitted" : ""}>
            <div className="oscar-statue-icon"></div>
            <div className="welcome-container">
                <h2>Welcome to the 97th Academy Awards</h2>
                <h3>Make your predictions and compete with friends!</h3>
                
                <form onSubmit={handleSubmit} className="name-input-form">
                    <div className="input-container">
                        <input
                            type="text"
                            id="userName"
                            placeholder="Enter Your Name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={isFormSubmitted}
                        />
                        <label htmlFor="userName" className="floating-label">Enter Your Name</label>
                    </div>
                    
                    <button 
                        type="submit" 
                        id="submit-name-button"
                        disabled={isFormSubmitted}
                    >
                        {isFormSubmitted ? "Welcome..." : "Enter Oscar Predictions"}
                    </button>
                </form>
                
                <div className="awards-date">
                    <p>The 97th Academy Awards will be held on March 2, 2025</p>
                </div>
            </div>
        </div>
    );
}

export default NameInputSection;