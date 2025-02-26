import React from 'react';

function NameInputSection({ onNameSubmit }) {
    const [userName, setUserName] = React.useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (userName.trim() !== "") {
            onNameSubmit(userName);
        } else {
            alert("Please enter your name.");
        }
    };

    return (
        <div id="name-input-section">
            <h2>Enter Your Name</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="userName"
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <button type="submit" id="submit-name-button">Start Predicting</button>
            </form>
        </div>
    );
}

export default NameInputSection;