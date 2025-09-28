document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the user ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    // Check if an ID was provided
    if (!userId) {
        console.error('No user ID found in the URL. Redirecting to login.');
        // Optionally redirect to the login page if no ID is found
        // window.location.href = 'index.html'; // Assuming index.html is the login page
        // We'll stop execution here if no ID is present
        renderPlaceholderProfile();
        return;
    }

    // Function to fetch data and render the profile
    async function loadAndRenderProfile(id) {
        try {
            // Fetch the profile data (adjust path if needed)
            const response = await fetch('js/data/profiles.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const profiles = await response.json();

            // Find the user profile matching the ID
            const userProfile = profiles.find(profile => profile.id === id);

            if (userProfile) {
                // SUCCESS: Profile found, now render the data
                renderProfileData(userProfile);
            } else {
                // FAILURE: Profile not found for the given ID
                console.error(`Profile not found for ID: ${id}`);
                // Render a placeholder or error message
                renderPlaceholderProfile(id);
            }

        } catch (error) {
            console.error('Error loading or parsing profile data:', error);
            // Render an error state
            renderPlaceholderProfile(id, 'Prišlo je do napake pri nalaganju podatkov.');
        }
    }

    // Function to update the HTML elements with profile data
    function renderProfileData(profile) {
        // Update the user's name in the sidebar and welcome message
        const nameElements = document.querySelectorAll('#ime, #ime-dobrodoslice');
        nameElements.forEach(element => {
            // We'll use the first word of 'ime' for the welcome message, and the full name for the sidebar
            if (element.id === 'ime-dobrodoslice') {
                 // Get the first name for the welcome message
                const firstName = profile.ime.split(' ')[0]; 
                element.textContent = firstName || 'Uporabnik';
            } else {
                // Use the full name for the sidebar
                element.textContent = profile.ime || 'Neznano Ime';
            }
        });

        // Update the user's title/naziv in the sidebar
        const nazivElements = document.querySelectorAll('#naziv');
        nazivElements.forEach(element => {
            element.textContent = profile.naziv || 'Splošni Uporabnik';
        });

        // Update profile details in the content panel
        const emailElement = document.getElementById('email');
        if (emailElement) {
            emailElement.textContent = profile.email || 'Ni podatka';
        }

        const telefonElement = document.getElementById('telefon');
        if (telefonElement) {
            telefonElement.textContent = profile.telefon || 'Ni podatka';
        }
    }

    // Function to handle cases where the profile can't be loaded or found
    function renderPlaceholderProfile(id = 'Neznano', message = 'Profil ni najden.') {
        // This is a minimal fallback implementation
        const nameElements = document.querySelectorAll('#ime, #ime-dobrodoslice');
        nameElements.forEach(element => {
            element.textContent = 'Gost';
        });

        const nazivElement = document.querySelector('.uporabniski-naziv');
        if (nazivElement) {
            nazivElement.textContent = 'Gost';
        }

        const contentPanel = document.querySelector('.vsebinski-panel');
        if (contentPanel) {
            contentPanel.innerHTML = `
                <h2>${message}</h2>
                <p>Uporabniški ID: ${id}. Prosimo, poskusite se prijaviti ponovno.</p>
            `;
        }
    }


    // Initiate the profile loading process
    loadAndRenderProfile(userId);
});