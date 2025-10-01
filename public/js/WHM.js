const loggedInUserId = sessionStorage.getItem('loggedInUserId');

// Preverite, ali je uporabnik prijavljen
if (!loggedInUserId) {
    // Če uporabnik ni prijavljen, ga preusmerite na stran za prijavo
    window.location.href = 'Prijava.html';
}

//Posodobiko URL z ID-jem uporabnika
const url = new URL(window.location.href);
url.searchParams.set('id', loggedInUserId);
window.history.replaceState({}, '', url);