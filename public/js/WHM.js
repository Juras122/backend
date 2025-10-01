// WHM.js

// Funkcija za posodobitev navigacije v WHM.html
function posodobiNavigacijskePovezaveWHM(userId) {
    // Povezava nazaj na Profil
    const profilLink = document.querySelector('.stranska-vrstica-meni a[href="Profil.html"]');

    if (profilLink) {
        profilLink.href = `Profil.html?id=${userId}`;
    }
    
    // Povezava za Evidenca delovnega časa (za re-render/refresh)
    const evidencaLink = document.querySelector('.stranska-vrstica-meni a[href="WHM.html"]');
    if (evidencaLink) {
        evidencaLink.href = `WHM.html?id=${userId}`;
    }
}

// Funkcija, ki se zažene ob nalaganju strani WHM
function naloziInPrikaziEvidenco() {
    // 1. PRIDOBI ID UPORABNIKA IZ URL-ja
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (userId) {
        // POSODOBI POVEZAVE TUDI NA TEJ STRANI
        posodobiNavigacijskePovezaveWHM(userId); 
        
        // Kličite API za nalaganje delovnega časa z userId
        // npr. await fetch(`/api/workhours/${userId}`);
        
    } else {
        console.error("Napaka: ID uporabnika ni najden v URL parametrih WHM.");
        // Prikaži napako
    }
}

naloziInPrikaziEvidenco();