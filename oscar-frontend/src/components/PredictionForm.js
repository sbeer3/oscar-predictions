import React, { useState, useEffect } from 'react';

const API_KEY = '12003788be788c69459f04273fa2c790'; // Replace with your actual TMDB API key!
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function PredictionForm({ categories, onSubmitPredictions }) {
    const [predictions, setPredictions] = React.useState({});
    const [nomineeImages, setNomineeImages] = useState({});
    const [areImagesLoaded, setAreImagesLoaded] = useState(false); // Loading state for images
    // if (!categories) {
    //     return <div>Loading categories...</div>; // Still show loading for categories
    // }

    useEffect(() => {
        const fetchImages = async () => {
            setAreImagesLoaded(false); // Start loading
            const images = {};
            let allImagesLoadedSuccessfully = false; // Track if all images loaded without errors

            for (const categoryName in categories) {
                for (const nomineeObj of categories[categoryName]) {
                    let imageName = nomineeObj.nominee;
                    let imageType = 'movie';
                    if (nomineeObj.movie) {
                        imageType = 'person';
                    }

                    const imageUrl = await fetchImageData(imageName, imageType);
                    if (imageUrl) {
                        images[`${categoryName}-${nomineeObj.nominee}`] = imageUrl;
                    } else {
                        
                        console.warn(`Could not load image for ${nomineeObj.nominee} (${categoryName})`);
                    }
                }
            }
            allImagesLoadedSuccessfully = true; // If any image fails to load, mark as not fully loaded
            setNomineeImages(images);
            setAreImagesLoaded(allImagesLoadedSuccessfully); // Set loaded based on success flag
            console.log("nomineeImages state:", images);
            console.log("areImagesLoaded:", areImagesLoaded); // Debug loading state
        };

        fetchImages();
    }, [categories]);

    const handleRadioChange = (categoryName, nomineeName) => {
        setPredictions(prevPredictions => ({
            ...prevPredictions,
            [categoryName]: nomineeName,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmitPredictions(predictions);
    };

    

    async function fetchImageData(query, type) {
        const searchUrl = `${BASE_URL}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&year=2024`;

        try {
            const response = await fetch(searchUrl);
            if (!response.ok) { // Check for HTTP errors (4xx, 5xx)
                console.error(`HTTP error! status: ${response.status} for query: ${query}, type: ${type}`);
                return null; // Treat HTTP error as image not found
            }
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                let imagePath;

                if (type === 'movie') {
                    imagePath = result.poster_path;
                } else if (type === 'person') {
                    imagePath = result.profile_path;
                }

                if (imagePath) {
                    return IMAGE_BASE_URL + imagePath;
                }
            }
            return null; // No image found in TMDB results
        } catch (error) {
            console.error('Error fetching image data:', error); // Log fetch errors
            return null;
        }
    }

    return (
        <div id="prediction-form">
            {/* Conditionally render the form based on areImagesLoaded */}
            {!areImagesLoaded ? (
                <div>Loading Predictions and Images...</div>
            ) : (
                <form id="oscar-form" onSubmit={handleSubmit}>
                    {Object.keys(categories).map(categoryName => (
                        <div key={categoryName} className="category-group" id={categoryNameToId(categoryName)}>
                            <h3 className="category-title">{categoryName}</h3>
                            {categories[categoryName].map(nomineeObj => (
                                <div key={nomineeObj.nominee} className="nominee-option">
                                    <input
                                        type="radio"
                                        name={categoryName}
                                        value={nomineeObj.nominee}
                                        id={`${categoryNameToId(categoryName)}-${nomineeObj.nominee.replace(/\s+/g, '-')}`}
                                        onChange={() => handleRadioChange(categoryName, nomineeObj.nominee)}
                                    />
                                    <label htmlFor={`${categoryNameToId(categoryName)}-${nomineeObj.nominee.replace(/\s+/g, '-')}`}>
                                        {/* Images are now guaranteed to be loaded (or loading failed) */}
                                        {nomineeImages[`${categoryName}-${nomineeObj.nominee}`] && (
                                            <img
                                                src={nomineeImages[`${categoryName}-${nomineeObj.nominee}`]}
                                                alt={nomineeObj.nominee}
                                                style={{ width: '100px', marginRight: '10px', verticalAlign: 'middle' }}
                                            />
                                        )}
                                        {nomineeObj.nominee} {nomineeObj.movie && `(${nomineeObj.movie})`}
                                    </label>
                                </div>
                            ))}
                        </div>
                    ))}
                    <button type="submit" id="submitPredictions">Submit Predictions</button>
                </form>
            )}
        </div>
    );
}


function categoryNameToId(categoryName) {
    return categoryName.replace(/\s+/g, '-').toLowerCase();
}

export default PredictionForm;