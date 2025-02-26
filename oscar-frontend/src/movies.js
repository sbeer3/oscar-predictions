// Replace 'YOUR_API_KEY' with your actual TMDb API key.
const API_KEY = '';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Adjust image size as needed.

async function fetchImageData(query, type) {
    const searchUrl = `${BASE_URL}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&year=2024`; // Add year=2024

    try {
        const response = await fetch(searchUrl);
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
        return null; // No image found
    } catch (error) {
        console.error('Error fetching image data:', error);
        return null;
    }
}

async function addImagesToNominees() {
    const nomineeLabels = document.querySelectorAll('.nominee-option label'); // or however you select your nominees
    for (const label of nomineeLabels) {
        const nomineeName = label.textContent.trim();
        // console.log('Adding image for:', label);
        let imageSrc = null;
        let type = 'movie';

        if(label.dataset.actor){
            type = 'person';
            imageSrc = await fetchImageData(label.dataset.actor, type);
        } else if (label.dataset.movie){
            type = 'movie';
            imageSrc = await fetchImageData(label.dataset.movie, type);
        }

        if (imageSrc) {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = nomineeName;
            img.style.width = '100px'; // Adjust size as needed.
            img.style.marginRight = '10px'; // Add spacing.
            label.prepend(img); // Add image before the label text
        }
    }
}

// Call the function when the page loads or after the nominees are loaded.
window.addEventListener('load', addImagesToNominees);