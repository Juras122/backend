//-------------------------------------------------------------------------------------------------------
// Nastavimo ID prijavljenega uporabnika v URL, če še ni nastavljen
const loggedInUserId = sessionStorage.getItem('loggedInUserId');

const url = new URL(window.location.href);
if (loggedInUserId) { 
    url.searchParams.set('id', loggedInUserId);
}

window.history.replaceState({}, '', url);

//-------------------------------------------------------------------------------------------------------

// Preberemo ID uporabnika iz URL-ja
const urlId = new URLSearchParams(window.location.search);
const userId = urlId.get('id');

// API klici
const API_PROFILI = `/api/profiles/${userId}`;
const API_PRIDOBITEV_SERIJSKE_IZ_DB = `/api/rdn`; // Pridobitev serijske številke iz baze podatkov

//-----------------------------------------------------------------------------------
// Pridobi uporabnikov profil (ime in naziv) in ga prikaže v stranski vrstici.

async function naloziInPrikaziProfil() {
    if (!userId) {
        console.error('ID uporabnika ni najden v URL-ju.');
        return;
    }
    try {
        const response = await fetch(PROFILI_API_URL);
        if (response.status === 404) {
            console.error('Profil ni najden.');
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP napaka! Status: ${response.status}`);
        }
        const userProfile = await response.json();
        prikaziPodatkeProfila(userProfile);
    } catch (error) {
        console.error('Napaka pri nalaganju profila:', error);
    }
}

function prikaziPodatkeProfila(profil) {
    const userNameDisplayElements = document.querySelectorAll('#ime');
    userNameDisplayElements.forEach(element => {
        element.textContent = profil.ime || 'Neznano Ime';
    });

    const titleDisplayElements = document.querySelectorAll('.naziv, #naziv');
    titleDisplayElements.forEach(element => {
        element.textContent = profil.naziv || 'Neznan Naziv';
    });
}

//-----------------------------------------------------------------------------------

// js/PDN.js

// Function to fetch data from the API and populate the table
async function loadDelovniNalogi() {
    // 1. Define the API endpoint URL
    // *** REPLACE with your actual API endpoint on Render ***
    const apiUrl = API_PRIDOBITEV_SERIJSKE_IZ_DB;

    const tableBody = document.getElementById('telo-tabele');
    
    // Clear any existing content in the table body
    tableBody.innerHTML = ''; 

    try {
        // 2. Make the API request
        const response = await fetch(apiUrl);

        // Check if the request was successful (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 3. Parse the JSON response
        const delovniNalogi = await response.json();
        
        // Ensure the response is an array of objects
        if (!Array.isArray(delovniNalogi)) {
            console.error('API response is not an array:', delovniNalogi);
            // Optionally, display an error message in the table
            tableBody.innerHTML = '<tr><td colspan="6">Napaka pri pridobivanju podatkov.</td></tr>';
            return; 
        }

        // 4. Iterate over the data and create table rows
        delovniNalogi.forEach(nalog => {
            const row = tableBody.insertRow(); // Create a new <tr> element

            // Insert cells (<td>) for each column based on your table header:
            // Serijska številka, Lokacija, Vrsta, Material, Rok izvedbe, Načrti
            
            // Note: Replace 'nalog.serial_number', 'nalog.location', etc. 
            // with the actual property names returned by your API.
            
            row.insertCell().textContent = nalog.serijska_stevilka; // Example property
            row.insertCell().textContent = nalog.lokacija;          // Example property
            row.insertCell().textContent = nalog.vrsta;             // Example property
            row.insertCell().textContent = nalog.material;          // Example property
            
            // Format the date if necessary
            const formattedDate = new Date(nalog.rok_izvedbe).toLocaleDateString('sl-SI'); 
            row.insertCell().textContent = formattedDate;           // Example property
            
            // For 'Načrti' (Plans/Drawings), you might want a link or button
            const nacrtiCell = row.insertCell();
            if (nalog.nacrti_url) { // Example property
                const link = document.createElement('a');
                link.href = nalog.nacrti_url; 
                link.textContent = 'Poglej';
                link.target = '_blank'; // Open in new tab
                nacrtiCell.appendChild(link);
            } else {
                nacrtiCell.textContent = 'Ni na voljo';
            }
        });

    } catch (error) {
        console.error('Fetching data failed:', error);
        // Display an error message to the user
        tableBody.innerHTML = '<tr><td colspan="6">Napaka pri povezavi s strežnikom. Poskusite znova.</td></tr>';
    }
}

//-----------------------------------------------------------------------------------
// Ko je stran naložena, zaženemo nalaganje podatkov
document.addEventListener('DOMContentLoaded', () => {
    naloziInPrikaziProfil();
    naloziInPrikaziDelovniCas();
});
//----------------------------------------------------------------------------------------