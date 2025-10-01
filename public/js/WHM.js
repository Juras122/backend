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
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

// API klici
const PROFILI_API_URL = `/api/profiles/${userId}`;
const DELOVNI_CAS_API_URL = `/api/workhours/${userId}`;

// *** TUKAJ NE SME BITI GLOBALNE DEFINICIJE tabelaTeloElement, KER JE null pred DOM Ready ***

// -----------------------------------------------------------------------------------
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
// -----------------------------------------------------------------------------------

/**
 * Pridobi evidenco delovnega časa in jo prikaže v tabeli.
 */
async function naloziInPrikaziDelovniCas() {
    if (!userId) return;
    
    // PRIDOBITEV ELEMENTA ZNOTRAJ FUNKCIJE!
    const tabelaTeloElement = document.getElementById('telo-tabele');
    if (!tabelaTeloElement) {
        console.error('Element tabele (tabelaTeloElement) ni najden. Preveri ID "tabela-telo" v HTML-ju.');
        return;
    }
    // KODA ZDAJ NADALJUJE, KER JE ELEMENT NAJDEN

    try {
        const response = await fetch(DELOVNI_CAS_API_URL); 

        if (!response.ok) {
            if (response.status === 404) {
                prikaziSporociloBrezPodatkov(tabelaTeloElement); // POSREDOVANJE ELEMENTA
                return;
            }
            throw new Error(`HTTP napaka! Status: ${response.status}`);
        }

        const workHoursData = await response.json();

        if (!workHoursData || workHoursData.length === 0) {
            prikaziSporociloBrezPodatkov(tabelaTeloElement); // POSREDOVANJE ELEMENTA
            return;
        }

        tabelaTeloElement.innerHTML = ''; // Počisti prejšnje vrstice

        workHoursData.forEach(entry => {
            const row = tabelaTeloElement.insertRow();

            row.innerHTML = `
                <td>${entry.datum || ''}</td>
                <td>${entry.dan || ''}</td>
                <td>${entry.prihod || ''}</td>
                <td>${entry.odhod || ''}</td>
                <td>${entry.stevilo || ''}</td>
            `;
        });


    } catch (error) {
        console.error('Napaka pri nalaganju evidence delovnega časa:', error);
    }
}



// Ko je stran naložena, zaženemo nalaganje podatkov
document.addEventListener('DOMContentLoaded', () => {
    naloziInPrikaziProfil();
    naloziInPrikaziDelovniCas();
});


// ... (nadaljevanje event listenerjev) ...
