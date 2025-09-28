// index.js (FIXED)

// 1. REQUIRE PATH MODULE
const express = require('express');
const path = require('path'); 

const app = express();

const PORT = process.env.PORT || 3000;

// 2. SERVE STATIC FILES FROM 'public' DIRECTORY
// Assuming all client-side files are in a 'public' folder.
app.use(express.static(path.join(__dirname, 'public'))); 

// 3. CORRECT ROOT ROUTE TO SERVE index.html
app.get('/', (req, res) => {
    // The static middleware typically handles the root index file, 
    // but explicitly serving it here ensures the main entry point is correct.
    res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});
