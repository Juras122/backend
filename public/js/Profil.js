// Nastavite to funkcijo kot asinhrono, saj bomo klicali API
async function naloziInPrikaziProfil() {
    // 1. PRIDOBI ID UPORABNIKA IZ URL-ja
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id'); // TUKAJ IMATE ID UPORABNIKA

    sessionStorage.setItem('loggedInUserId', userId);

    // Če ID ni najden, prikaži napako in prekini
    if (!userId) {
        console.error("Napaka: ID uporabnika ni najden v URL parametrih.");
        // Lahko bi preusmerili na stran za prijavo ali prikazali sporočilo na strani
        document.querySelector('.glavno-obmocje-vsebine').innerHTML = '<h1>Napaka: Profil ni določen.</h1>';
        return;
    }

    // 2. KLIC API-ja
    try {
        // Kličemo API končno točko, ki jo določa Express strežnik: /api/profiles/:id
        const response = await fetch(`/api/profiles/${userId}`);

        if (!response.ok) {
            // Če strežnik vrne status 404 ali drug status napake
            if (response.status === 404) {
                document.querySelector('.glavno-obmocje-vsebine').innerHTML = '<h1>Profil ni najden (404)</h1><p>Uporabnik s tem ID-jem ne obstaja.</p>';
            } else {
                // Druga napaka strežnika (npr. 500)
                document.querySelector('.glavno-obmocje-vsebine').innerHTML = `<h1>Napaka pri nalaganju: ${response.status}</h1>`;
            }
            console.error(`API klic neuspešen: ${response.status}`);
            return;
        }

        // Pretvorba odgovora v JSON
        const userData = await response.json();

        // 3. PRIKAZ PODATKOV NA STRANI
        prikaziPodatkeProfila(userData);

    } catch (error) {
        // Napaka pri omrežnem klicu (npr. strežnik ne deluje)
        console.error("Prišlo je do napake pri pridobivanju podatkov profila:", error);
        document.querySelector('.glavno-obmocje-vsebine').innerHTML = '<h1>Napaka povezave</h1><p>Ni mogoče vzpostaviti povezave s strežnikom. Poskusite znova kasneje.</p>';
    }
}

// Funkcija za posodabljanje elementov DOM-a s podatki profila
function prikaziPodatkeProfila(profil) {
    // Posodobitev elementov v stranski vrstici in glavi
    const userNameDisplayElements = document.querySelectorAll('#ime');
    userNameDisplayElements.forEach(element => {
        // Predpostavimo, da ima baza stolpec 'ime'
        element.textContent = profil.ime || profil.username || 'Neznano Ime';
    });

    // Posodobitev elementa naziva v stranski vrstici in podrobnostih
    const titleDisplayElements = document.querySelectorAll('.naziv, #naziv');
    titleDisplayElements.forEach(element => {
        // Predpostavimo, da ima baza stolpec 'naziv' (ali 'title')
        element.textContent = profil.naziv || profil.title || 'Neznan Naziv';
    });
    
    // Posodobitev imena za pozdrav
    document.getElementById('ime-dobrodoslice').textContent = profil.ime || profil.username || 'Uporabnik';


    // Posodobitev ostalih podrobnosti v glavnem območju
    // Predpostavljeni stolpci: email, telefon
    document.getElementById('email').textContent = profil.email || 'N/A';
    document.getElementById('telefon').textContent = profil.telefon || 'N/A';
}

// 4. Klic funkcije ob nalaganju strani
naloziInPrikaziProfil();

//Ce pritisnemo gumb link WHM.html, nas preusmeri na WHM.html z id-jem uporabnika v URL-ju window.location.href = `Profil.html?id=${enteredId}`;
if (document.getElementById('WHM.html')) {
    document.getElementById('WHM.html').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `WHM.html?id=${sessionStorage.getItem('loggedInUserId')}`;
    });
}

// Dodatno: Logika za gumb za odjavo (osnovna placeholder implementacija)
document.getElementById('gumb-odjava').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm("Ali se res želite odjaviti?")) {
        // Sem vstavite logiko za odjavo (npr. brisanje piškotka/žetona)
        console.log("Uporabnik odjavljen.");
        alert("Uspešno ste se odjavili! (To je le simulacija)");
        // window.location.href = '/login.html'; // Preusmeritev na stran za prijavo
    }
});
