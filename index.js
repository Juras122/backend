//KNJIŽNICE
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const cors = require('cors'); // <-- Uvozi knjižnico

//Nastavljanje expressa in porta
const app = express();
const PORT = process.env.PORT || 3000;

// Definicija vseh dovoljenih domen (originov)
const allowedOrigins = [
    'https://zaposleni-lpt-test.onrender.com', 
    'https://185bf941-648e-4a60-8785-0f06730e4ab2.lovableproject.com',
    'http://localhost:8080/',
    // TUKAJ LAHKO DODATE VSE OSTALE DOMENE (npr. http://localhost:5173 za lokalni razvoj)
];

// Konfiguracija CORS: 'origin' je sedaj polje 'allowedOrigins'
app.use(cors({
    origin: '*', // Uporabite polje dovoljenih domen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true // pogosto potrebno, če uporabljate piškotke (cookies) ali avtentikacijo
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

//--------------------------------------------------------------------------------------------------------
// API

// 3. NEW API ENDPOINT: Fetch a single profile by ID
// Clients will now call this endpoint instead of reading profiles.json
app.get('/api/profiles/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // Query the 'users' table (your new table name) for the user ID
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]); // Pridobivanje podatkov iz SQL baze podatkov

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

app.get('/api/workhours/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM whm WHERE id = $1', [userId]);
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.status(404).json({ message: 'Work hours not found' });
        }
    } catch (error) {
        console.error('Error fetching work hours from DB:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/rdn', async (req, res) => {
    try {
        // Corrected SQL query to select all required columns
        const result = await pool.query(
            'SELECT "serijska", "lokacija", "vrsta", "material", "r_razpisa", "nacrt" FROM rdn'
        );

        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            // A 200 OK status with an empty array is often better for a list view
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching work orders from DB:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/rdn/:serijska', async (req, res) => {
    const serijska = req.params.serijska;

    try {
        const result = await pool.query('SELECT * FROM rdn WHERE serijska = $1', [serijska]);
        if (result.rows.length > 0) {
            // POPRAVEK: Vrnemo samo prvi (in edini) objekt iz polja
            res.json(result.rows[0]); 
        } else {
            res.status(404).json({ message: 'Delovni nalog ni najden' });
        }
    } catch (error) {
        console.error('Error fetching work hours from DB:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/warehouse', async (req, res) => {
    try {
        // Popravi ime tabele in stolpcev glede na vašo dejansko bazo
        const result = await pool.query(
            'SELECT id, serijska_koda, ime, stevilo, enota, lokacija, datum_vnosa, zadnja_sprememba FROM warehouse' 
        );

        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching warehouse items from DB:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/profiles', async (req, res) => {
  try {
    // SQL query za pridobitev vseh uporabnikov
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Napaka pri pridobivanju uporabnikov:', error);
    res.status(500).json({ error: 'Napaka pri pridobivanju podatkov' });
  }
});

app.post('/api/work-entries', async (req, res) => {
  try {
    const { workOrderId, nazivElementa, znacilka, dolzina, stElementov, material, kvadratura } = req.body;

    if (!workOrderId || !nazivElementa) {
      return res.status(400).json({ message: 'Manjkajo obvezna polja' });
    }

    const result = await pool.query(
      `INSERT INTO we (work_order_id, naziv_elementa, znacilka, dolzina, st_elemtov, material, kvadratura, datum_vnosa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [workOrderId, nazivElementa, znacilka || null, dolzina || null, stElementov || null, material || null, kvadratura || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding work entry:', error);
    console.error('Error details:', error.message); // ← Dodajte ta log!
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// GET /api/work-entries/:workOrderId
app.get('/api/work-entries/:workOrderId', async (req, res) => {
  try {
    const { workOrderId } = req.params;

    const result = await pool.query(
      'SELECT * FROM we WHERE work_order_id = $1 ORDER BY datum_vnosa DESC',
      [workOrderId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching work entries:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





//--------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//--------------------------------------------------------------------------------------------------------





















