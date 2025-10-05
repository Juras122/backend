// Posodobitev URL-ja z ID-jem, če je že shranjen v sessionStorage
const loggedInUserId = sessionStorage.getItem('loggedInUserId');
const urlParams = new URLSearchParams(window.location.search);
const urlUserId = urlParams.get('id');

// Če je ID v sessionStorage, vendar ni v URL-ju, ga dodamo v URL.
// To je za boljši UX po uspešni prijavi.
if (loggedInUserId && !urlUserId) {
    const url = new URL(window.location.href);
    url.searchParams.set('id', loggedInUserId);
    // Uporaba replaceState namesto dodajanja v zgodovino
    window.history.replaceState({}, '', url);
}

// Globalna funkcija za poenostavitev posodabljanja DOM-a
function posodobiBesedilo(selector, vsebina, privzeto = 'N/A') {
    const elementi = document.querySelectorAll(selector);
    elementi.forEach(element => {
        element.textContent = vsebina || privzeto;
    });
}

// Funkcija za posodabljanje elementov DOM-a s podatki profila
function prikaziPodatkeProfila(profil, delovniCas) {
    // 1. Posodobitev imena za pozdrav in stranske vrstice
    const ime = profil.ime || profil.username;
    posodobiBesedilo('#ime-dobrodoslice', ime, 'Uporabnik');
    posodobiBesedilo('#ime_stranska_vrstica', ime);
    posodobiBesedilo('#ime_podrobnosti', ime);

    // 2. Posodobitev naziva v stranski vrstici in podrobnostih
    const naziv = profil.naziv || profil.title;
    posodobiBesedilo('#naziv_stranska_vrstica', naziv);
    posodobiBesedilo('#naziv_podrobnosti', naziv);

    // 3. Posodobitev ostalih podrobnosti
    posodobiBesedilo('#email', profil.email);
    posodobiBesedilo('#telefon', profil.telefon);
    
    // 4. Posodobitev povezav stranske vrstice z ID-jem
    nastaviPovezaveMeni(profil.id);

    //seštevek delovnih ur
    const skupniDelovniCas = delovniCas.reduce((sestevek, trenutni) => sestevek + trenutni, 0);

    // 5. Prikaz delovnega časa
    posodobiBesedilo('#stat_cas', skupniDelovniCas || 'N/A');


    // 5. Prikaz statistike (Če bi API vrnil tudi statistiko, bi jo posodobili tukaj)
    // npr.: document.getElementById('stat_cas').textContent = profil.statistika.delovniCas || '0';
}


// Nastavite to funkcijo kot asinhrono, saj bomo klicali API
async function naloziInPrikaziProfil() {
    // ID-je iščemo v tej prioriteti: URL parameter > sessionStorage
    const currentUserId = urlParams.get('id') || loggedInUserId;

    // Če ID ni najden niti v URL-ju niti v sessionStorage, prekini.
    if (!currentUserId) {
        console.error("Napaka: ID uporabnika ni določen.");
        document.querySelector('.glavno-obmocje-vsebine').innerHTML = '<h1>Napaka: Profil ni določen. Prosimo, prijavite se.</h1>';
        return;
    }
    
    // Shranimo ID, da bo na voljo za druge strani (WHM, PDN, itd.)
    sessionStorage.setItem('loggedInUserId', currentUserId);

    // 2. KLIC API-ja
    try {
        const user_response = await fetch(`/api/profiles/${currentUserId}`);

        if (!user_response.ok) {
            // Bolj natančna obravnava napak
            const errorMessage = await user_response.text(); 
            const htmlContent = `<h1>Napaka pri nalaganju: ${user_response.status}</h1><p>${user_response.status === 404 ? 'Profil ni najden. Uporabnik morda ne obstaja.' : errorMessage}</p>`;
            document.querySelector('.glavno-obmocje-vsebine').innerHTML = htmlContent;
            console.error(`API klic neuspešen: ${user_response.status} - ${errorMessage}`);
            return;
        }

        // Pretvorba odgovora v JSON
        const userData = await user_response.json();

        const whm_response = await fetch(`/api/workhours/${currentUserId}`);

        if (!whm_response.ok) {
            // Bolj natančna obravnava napak
            const errorMessage = await whm_response.text(); 
            const htmlContent = `<h1>Napaka pri nalaganju: ${whm_response.status}</h1><p>${whm_response.status === 404 ? 'Profil ni najden. Uporabnik morda ne obstaja.' : errorMessage}</p>`;
            document.querySelector('.glavno-obmocje-vsebine').innerHTML = htmlContent;
            console.error(`API klic neuspešen: ${whm_response.status} - ${errorMessage}`);
            return;
        }

        // Pretvorba odgovora v JSON
        const userhourData = await whm_response.json();

        // 3. PRIKAZ PODATKOV NA STRANI
        prikaziPodatkeProfila(userData, userhourData);

    } catch (error) {
        // Napaka pri omrežnem klicu
        console.error("Prišlo je do napake pri pridobivanju podatkov profila:", error);
        document.querySelector('.glavno-obmocje-vsebine').innerHTML = '<h1>Napaka povezave</h1><p>Ni mogoče vzpostaviti povezave s strežnikom. Poskusite znova kasneje.</p>';
    }
}

// Funkcija za dinamično posodabljanje povezav v stranski vrstici z ID-jem
function nastaviPovezaveMeni(userId) {
    const povezave = [
        { id: 'povezava_WHM', href: 'WHM.html' },
        { id: 'povezava_PDN', href: 'PDN.html' },
        { id: 'povezava_PD_NSTO', href: 'PD_NSTO.html' }
    ];

    povezave.forEach(povezava => {
        const element = document.getElementById(povezava.id);
        if (element) {
            // Dodaj ID kot query parameter na vsako povezavo
            element.href = `${povezava.href}?id=${userId}`; 
        }
    });
}

// Klic glavne funkcije ob nalaganju strani
document.addEventListener('DOMContentLoaded', naloziInPrikaziProfil);


// Logika za gumb za odjavo
document.getElementById('gumb-odjava').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm("Ali se res želite odjaviti?")) {
        // Ob odjavi počistimo ID iz sessionStorage
        sessionStorage.removeItem('loggedInUserId'); 
        console.log("Uporabnik odjavljen.");
        alert("Uspešno ste se odjavili! (To je le simulacija)");
        // window.location.href = '/login.html'; // Preusmeritev na stran za prijavo
    }
});