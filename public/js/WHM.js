//-------------------------------------------------------------------------------------------------------

// Nastavimo ID prijavljenega uporabnika v URL, če še ni nastavljen
const loggedInUserId = sessionStorage.getItem('loggedInUserId');

const url = new URL(window.location.href);
if (loggedInUserId) { // ID nastavimo le, če obstaja
    url.searchParams.set('id', loggedInUserId);
}

window.history.replaceState({}, '', url);

//-------------------------------------------------------------------------------------------------------

// Preberemo ID uporabnika iz URL-ja
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

// API klici
const PROFILI_API_URL = `/api/profiles/${userId}`;
const DELOVNI_CAS_API_URL = `/api/workhours/${userId}`;

// *******************************************************************
// MORATE DODATI ta element, da koda deluje! Povezava na <tbody> v HTML-ju.
const tabelaTeloElement = document.getElementById('tabela-telo');
// *******************************************************************

// -----------------------------------------------------------------------------------

// Pridobi uporabnikov profil (ime in naziv) in ga prikaže v stranski vrstici.

async function naloziInPrikaziProfil() {
    if (!userId) {
        console.error('ID uporabnika ni najden v URL-ju.');
        // window.location.href = 'Prijava.html'; // Opomba: Če želite preusmeritev
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
            // Tudi 404 je ok, če ni vnosa
            if (response.status === 404) {
                prikaziSporociloBrezPodatkov();
                return;
            }
            throw new Error(`HTTP napaka! Status: ${response.status}`);
        }

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
            
            // Uporabljamo ključe iz vaše baze: datum, prihod, odhod, stevilo, opis
            const formattedDate = entry.datum || 'Neznano'; 
            
            // Uporabljamo ključ 'stevilo' in ga formatiramo (ob predpostavki, da je število)
            const hoursValue = parseFloat(entry.stevilo || 0);
            const formattedHours = isNaN(hoursValue) ? 'N/A' : hoursValue.toFixed(2); 

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${entry.dan || ''}</td>     <td>${entry.prihod || ''}</td>
                <td>${entry.odhod || ''}</td>
                <td>${formattedHours}</td>      <td>${entry.opis || ''}</td>
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
    // Klic mora biti znotraj try-catch ali preveriti element
    if (!tabelaTeloElement) return; 

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
    // Klic mora biti znotraj try-catch ali preveriti element
    if (!tabelaTeloElement) return;

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
