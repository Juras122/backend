document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the user ID from the URL query parameter
    // URL bi moral izgledati nekako takole: /profile.html?id=1
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    // Check if an ID was provided
    if (!userId) {
        console.error('Ni ID-ja uporabnika v URL-ju. Prikazujem začasni profil.');
        // Če ID ni podan, prikažemo napako/nadomestno vsebino
        renderPlaceholderProfile('Neznano', 'ID uporabnika ni bil najden v URL-ju.');
        return;
    }

    // Funkcija za pridobivanje podatkov s strežnika (Render Backend API) in prikaz profila
    async function loadAndRenderProfile(id) {
        try {
            // Fetch the profile data from the backend API endpoint
            // Ta klic se poveže z Node.js strežnikom (server.js), ki dostopa do baze!
            const response = await fetch(`/api/profiles/${id}`); 

            if (response.status === 404) {
                // Profil ni najden v bazi podatkov
                console.error(`Profil ni najden za ID: ${id}`);
                renderPlaceholderProfile(id, 'Profil ni najden v bazi.');
                return;
            }

            if (!response.ok) {
                // Obravnava drugih HTTP napak
                throw new Error(`HTTP napaka! Status: ${response.status}`);
            }

            // Backend vrne en sam objekt uporabnika v JSON formatu
            const userProfile = await response.json();

            if (userProfile && userProfile.id) {
                // USPEH: Profil najden, zdaj prikaži podatke
                // Opozorilo: Predpostavljamo, da so imena stolpcev v bazi (PostgreSQL)
                // v malih črkah: ime, naziv, email, telefon
                renderProfileData(userProfile);
            } else {
                console.error(`Neveljavni podatki profila za ID: ${id}`);
                renderPlaceholderProfile(id, 'Neznana napaka pri pridobivanju profila.');
            }

        } catch (error) {
            console.error('Napaka pri nalaganju podatkov:', error);
            // Prikaz napake pri povezavi (npr. strežnik ne deluje)
            renderPlaceholderProfile(id, 'Prišlo je do napake pri povezavi s strežnikom ali bazo.');
        }
    }

    // Funkcija za posodobitev HTML elementov s podatki profila
    function renderProfileData(profile) {
        // Posodobitev imena v stranski vrstici in naslovu
        // Uporabljamo querySelectorAll, ker se #ime pojavi dvakrat (v stranski vrstici in podrobnostih)
        const nameElements = document.querySelectorAll('#ime');
        nameElements.forEach(element => {
            element.textContent = profile.ime || 'Neznano Ime';
        });

        // Posodobitev imena za pozdrav (samo prva beseda)
        const welcomeNameElement = document.getElementById('ime-dobrodoslice');
        if (welcomeNameElement) {
            // Pridobitev prve besede za pozdrav ("Dobrodošli nazaj, [Janez]")
            const firstName = profile.ime ? profile.ime.split(' ')[0] : 'Uporabnik';
            welcomeNameElement.textContent = firstName;
        }

        // Posodobitev naziva v stranski vrstici (uporabljen je razred '.naziv')
        const nazivSidebarElement = document.querySelector('.naziv');
        if (nazivSidebarElement) {
            nazivSidebarElement.textContent = profile.naziv || 'Splošni Uporabnik';
        }
        
        // Posodobitev naziva v podrobnostih (#naziv)
        const nazivDetailsElement = document.getElementById('naziv');
        if (nazivDetailsElement) {
            nazivDetailsElement.textContent = profile.naziv || 'Ni podatka';
        }

        // Posodobitev podrobnosti profila
        const emailElement = document.getElementById('email');
        if (emailElement) {
            emailElement.textContent = profile.email || 'Ni podatka';
        }

        const telefonElement = document.getElementById('telefon');
        if (telefonElement) {
            telefonElement.textContent = profile.telefon || 'Ni podatka';
        }
    }

    // Funkcija za obravnavo primerov, ko profila ni mogoče naložiti ali najti
    function renderPlaceholderProfile(id = 'Neznano', message = 'Profil ni najden.') {
        // Nastavitev imena v stranski vrstici in pozdravu na 'Gost'
        const nameElements = document.querySelectorAll('#ime, #ime-dobrodoslice');
        nameElements.forEach(element => {
            element.textContent = 'Gost';
        });

        // Nastavitev naziva na 'Gost'
        const nazivElements = document.querySelectorAll('.naziv, #naziv');
        nazivElements.forEach(element => {
            element.textContent = 'Gost';
        });
        
        // Prikaz opozorila v glavnem delu vsebine
        const contentPanel = document.querySelector('.vsebinski-panel');
        if (contentPanel) {
            contentPanel.innerHTML = `
                <h2>${message}</h2>
                <p>Uporabniški ID: ${id}. Prosimo, preverite URL ali se poskusite prijaviti ponovno.</p>
            `;
        }
    }

    // Začetek postopka nalaganja profila, če je ID na voljo
    loadAndRenderProfile(userId);

});
