//-------------------------------------------------------------------------------------------------------

//Nastavimo ID prijavljenega uporabnika v URL, če še ni nastavljen
const loggedInUserId = sessionStorage.getItem('loggedInUserId');

const url = new URL(window.location.href);
url.searchParams.set('id', loggedInUserId);

window.history.replaceState({}, '', url);

//-------------------------------------------------------------------------------------------------------

//Preberemo ID uporabnika iz URL-ja
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

// API klici
const PROFILI_API_URL = `/api/profiles/${userId}`; // Predpostavljamo isti API kot v Prijava.js
const DELOVNI_CAS_API_URL = `/api/workhours/${userId}`; // NOVI API za delovni čas

// -----------------------------------------------------------------------------------

//Pridobi uporabnikov profil (ime in naziv) in ga prikaže v stranski vrstici.

async function naloziInPrikaziProfil() {
    if (!userId) {
        // V primeru, da ID-ja ni (če je uporabnik prišel naravnost na to stran)
        console.error('ID uporabnika ni najden v URL-ju.');
        // Lahko se odločite za preusmeritev na stran za prijavo
        // window.location.href = 'Prijava.html';
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
        
        // Prikaz podatkov v stranski vrstici
        prikaziPodatkeProfila(userProfile);

    } catch (error) {
        console.error('Napaka pri nalaganju profila:', error);
    }
}

function prikaziPodatkeProfila(profil) {
    // Posodobitev elementov v stranski vrstici in glavi
    const userNameDisplayElements = document.querySelectorAll('#ime');
    userNameDisplayElements.forEach(element => {
        element.textContent = profil.ime || 'Neznano Ime';
    });

    const titleDisplayElements = document.querySelectorAll('.naziv, #naziv');
    titleDisplayElements.forEach(element => {
        element.textContent = profil.naziv || 'Neznan Naziv';
    });
}
// -----------------------------------------------------------------------------------

/**
 * Pridobi evidenco delovnega časa in jo prikaže v tabeli.
 */

async function naloziInPrikaziDelovniCas() {
    if (!userId) return;

    try {
        const response = await fetch(DELOVNI_CAS_API_URL); 

        if (!response.ok) {
             // Tudi 404 je ok, če ni vnosa, le sporočilo se izpiše
            if (response.status === 404) {
                 prikaziSporociloBrezPodatkov();
                 return;
            }
            throw new Error(`HTTP napaka! Status: ${response.status}`);
        }

        // Predpostavljamo, da API vrne seznam (array) vnosov: 
        // [ { date: '2025-09-30', day: 'Ponedeljek', arrival: '08:00', departure: '16:00', hours: '8', description: 'Redno delo' }, ... ]
        const workHoursData = await response.json();

        // 1. Če ni podatkov, prikaži sporočilo
        if (!workHoursData || workHoursData.length === 0) {
            prikaziSporociloBrezPodatkov();
            return;
        }

        // 2. Napolni tabelo
        tabelaTeloElement.innerHTML = ''; // Počisti prejšnje vrstice

        workHoursData.forEach(entry => {
            const row = tabelaTeloElement.insertRow();
            
            // Formatiranje podatkov za prikaz
            const formattedDate = entry.date || 'Neznano'; 
            const formattedHours = parseFloat(entry.hours).toFixed(2); // Za prikaz dveh decimalnih mest

            row.innerHTML = `
                <td>${"#datum"}</td>
                <td>${entry.dan || ''}</td>
                <td>${entry.prihod || ''}</td>
                <td>${entry.odhod || ''}</td>
                <td>${'#stevilo' || ''}</td>
                <td>${entry.opis || ''}</td>
            `;
        });


    } catch (error) {
        console.error('Napaka pri nalaganju evidence delovnega časa:', error);
        prikaziSporociloNapake();
    }
}

/**
 * Pomožna funkcija za prikaz sporočila, če ni podatkov.
 */
function prikaziSporociloBrezPodatkov() {
    tabelaTeloElement.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 20px;">
                Za tega uporabnika še ni vnesene evidence delovnega časa.
            </td>
        </tr>
    `;
}

/**
 * Pomožna funkcija za prikaz splošne napake.
 */
function prikaziSporociloNapake() {
    tabelaTeloElement.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 20px; color: red;">
                Prišlo je do napake pri nalaganju podatkov.
            </td>
        </tr>
    `;
}


// Ko je stran naložena, zaženemo nalaganje podatkov
document.addEventListener('DOMContentLoaded', () => {
    naloziInPrikaziProfil();
    naloziInPrikaziDelovniCas();
});

// Dodamo event listenerje za gumba Prijavi/Odjavi (trenutno ne delata, ker nimamo implementiranega API-ja)
document.querySelector('.gumb-prijavi-delo').addEventListener('click', () => {
    alert('Funkcija za prijavo dela še ni implementirana.');
});

document.querySelector('.gumb-odjavi-delo').addEventListener('click', () => {
    alert('Funkcija za odjavo dela še ni implementirana.');
});