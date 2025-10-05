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

function prikaziDelovniNalog(delovniNalog) {
        document.getElementById('delovni-nalog-serijska').textContent = delovniNalog.serijska || 'Ni na voljo';
        document.getElementById('naslov').textContent = delovniNalog.naslov || 'Ni na voljo';
        document.getElementById('narocnik').textContent = delovniNalog.narocnik || 'Ni na voljo';
        document.getElementById('izvajalec').textContent = delovniNalog.izvajalec || 'Ni na voljo';
        document.getElementById('d-razpisa').textContent = delovniNalog.d_razpisa || 'Ni na voljo';
        document.getElementById('r-razpisa').textContent = delovniNalog.r_razpisa || 'Ni na voljo';
        document.getElementById('lokacija').textContent = delovniNalog.lokacija || 'Ni na voljo';
        document.getElementById('vrsta').textContent = delovniNalog.vrsta || 'Ni na voljo';
        document.getElementById('material').textContent = delovniNalog.material || 'Ni na voljo';
        document.getElementById('opis').textContent = delovniNalog.opis || 'Ni na voljo';
        document.getElementById('nacrt').textContent = delovniNalog.nacrt || 'Ni na voljo';
}
        

//----------------------------------------------------------------------------------------
// Ko je stran naložena, zaženemo nalaganje podatkov
document.addEventListener('DOMContentLoaded', () => {
    naloziInPrikaziProfil();
    naloziDelovniNalog();

});
//----------------------------------------------------------------------------------------
