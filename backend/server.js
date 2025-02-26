const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Enable CORS for frontend to talk to backend
const categoriesRoutes = require('./routes/categories');
const predictionsRoutes = require('./routes/predictions');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes (you can configure more specifically)
app.use(bodyParser.json()); // Parse JSON request bodies

// --- Routes ---
app.use('/api/categories', categoriesRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes); // Admin routes - protect these later

app.get('/', (req, res) => {
    res.send('Oscar Predictions Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});