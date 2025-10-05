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
const serijska = urlId.get('serijska');

//TEST
console.log('Uporabniški ID iz URL-ja:', userId);
console.log('Serijska številka iz URL-ja:', serijska);

//-----------------------------------------------------------------------------------

// API klici
const PROFILI_API_URL = `/api/profiles/${userId}`;
const API_PRIDOBITEV_SERIJSKE_IZ_DB = `/api/rdn/${serijska}`; // Pridobitev serijske številke iz baze podatkov
const API_POPIS_DELOVNIH_NALOGOV = `/api/pdn`; // Pridobitev delovnih nalogov iz baze podatkov

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
// Nalozi podatke delovnega naloga in jih prikaži na strani
async function naloziDelovniNalog() {
    try {
        const response = await fetch(API_PRIDOBITEV_SERIJSKE_IZ_DB);
        if (!response.ok) {
            throw new Error(`HTTP napaka! Status: ${response.status}`);
        }
        const delovniNalog = await response.json();
        console.log('Podatki delovnega naloga:', delovniNalog); // Testni izpis v konzolo
        prikaziDelovniNalog(delovniNalog);

    } catch (error) {
        console.error('Napaka pri nalaganju delovnih nalogov:', error);
    }

}

//-------------------------------------------------------------------------------------
// Funkcija za prikaz delovnega naloga na strani

// PDN_I.js - POPRAVKI

// ... (prejšnje funkcije ostanejo enake) ...

// Funkcija za prikaz delovnega naloga na strani
function prikaziDelovniNalog(delovniNalog) {
    // 1. Serijska številka
    document.getElementById('delovni-nalog-serijska').textContent = 'Delovni nalog: ' + (delovniNalog.serijska || 'Ni na voljo');

    // Pomožna funkcija za elegantno dodajanje vrednosti
    const updateElement = (id, label, value) => {
        const element = document.getElementById(id);
        if (element) {
            // Logika: 
            // 1. Ohrani labelo (npr. 'Naročnik'). 
            // 2. Dodaj dinamično vrednost v <span>, ki jo CSS stilizira za prikaz poleg labele.
            element.innerHTML = `${label}: <span class="dn-vrednost">${value || 'Ni na voljo'}</span>`;
        }
    };
    
    // Uporaba popravljenih ID-jev in label:
    updateElement('naslov', 'Naslov', delovniNalog.naslov);
    updateElement('narocnik', 'Naročnik', delovniNalog.narocnik);
    updateElement('izvajalec', 'Izvajalec', delovniNalog.izvajalec);
    updateElement('d-razpisa', 'Datum razpisa', delovniNalog.d_razpisa);
    
    // Uporaba POPRAVLJENEGA ID-ja: rok-izvedbe
    updateElement('rok-izvedbe', 'Rok izvedbe', delovniNalog.r_razpisa); 

    updateElement('lokacija', 'Lokacija', delovniNalog.lokacija);
    updateElement('vrsta', 'Vrsta', delovniNalog.vrsta);
    updateElement('material', 'Material', delovniNalog.material);
    updateElement('opis', 'Opis dela', delovniNalog.opis);
    
    // Uporaba POPRAVLJENEGA ID-ja: nacrti
    updateElement('nacrti', 'Načrti', delovniNalog.nacrt); 
    
    // Opomba: Popis dela (popis-dela-naslov) ne potrebuje dinamične vrednosti
}

// ... (ostali del ostane enak) ...
        

//----------------------------------------------------------------------------------------
// Ko je stran naložena, zaženemo nalaganje podatkov
document.addEventListener('DOMContentLoaded', () => {
    naloziInPrikaziProfil();
    naloziDelovniNalog();

});
//----------------------------------------------------------------------------------------

