const express = require('express');
const router = express.Router();
const oscarCategories = require('../oscars.json'); // Import your JSON data

router.get('/', (req, res) => {
    res.json(oscarCategories); // Send the JSON data as the API response
});

module.exports = router;