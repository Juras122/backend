//KNJIŽNICE
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

//Nastavljanje expressa in porta
const app = express();
const PORT = process.env.PORT || 3000;

// 2. DATABASE CONNECTION SETUP
// Render automatically provides a DATABASE_URL environment variable.
// We must configure SSL for a secure connection, as required by Render.
//Nastavitve kje deluje
const isProduction = process.env.NODE_ENV === 'production';

//Zaščita in optimizacija
const pool = new Pool({
    // Use the DATABASE_URL environment variable
    connectionString: process.env.DATABASE_URL,
    // Required for Render's external connections
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Optional: Test database connection
pool.query('SELECT NOW()')
    .then(res => console.log('Database connected successfully:', res.rows[0].now))
    .catch(err => console.error('Database connection error:', err.message));


// 3. NEW API ENDPOINT: Fetch a single profile by ID
// Clients will now call this endpoint instead of reading profiles.json
app.get('/api/profiles/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // Query the 'users' table (your new table name) for the user ID
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (result.rows.length > 0) {
            // Found the user - return the user object (JSON)
            res.json(result.rows[0]);
        } else {
            // User not found
            res.status(404).json({ message: 'Profile not found' });
        }
    } catch (error) {
        console.error('Error fetching profile from DB:', error);
        // Respond with a 500 status for any internal error
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// 4. SERVE STATIC FILES (Keep existing logic)
// Make sure all your client-side files (HTML, CSS, JS) are in a 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


