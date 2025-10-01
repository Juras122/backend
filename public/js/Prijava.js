document.addEventListener('DOMContentLoaded', () => {
    // Get references to the form elements
    const loginForm = document.getElementById('loginForm');
    const userIdInput = document.getElementById('userId');
    const errorMessage = document.getElementById('errorMessage');

    // Add an event listener to handle form submission
    loginForm.addEventListener('submit', async (event) => {
        // Prevent the default form submission (which would refresh the page)
        event.preventDefault(); 
        
        // Clear any previous error message
        errorMessage.textContent = ''; 

        const enteredId = userIdInput.value.trim();

        if (!enteredId) {
            errorMessage.textContent = 'Prosimo, vnesite identifikacijsko številko.';
            return;
        }

         try {
            // 1. Fetch the profile data from the new API endpoint
            const response = await fetch(`/api/profiles/${enteredId}`); // <-- UPDATED FETCH URL

            if (response.status === 404) {
                // FAILURE: Profile not found (ID is incorrect)
                errorMessage.textContent = 'Identifikacijska številka ni pravilna.';
                return;
            }
            
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const userProfile = await response.json(); // API returns a single profile object
            
            // 2. We already know the profile exists from the 404 check
            if (userProfile && userProfile.id) { 
                // SUCCESS: ID is correct
                
                sessionStorage.setItem('loggedInUserId', enteredId); 

                // 3. Redirect to the profile page
                window.location.href = `Profil.html?id=${enteredId}`; 

            } else {
                // FALLBACK: ID is incorrect
                errorMessage.textContent = 'Identifikacijska številka ni pravilna.';
            }

        } catch (error) {
            console.error('Napaka pri prijavi ali nalaganju podatkov:', error);
            errorMessage.textContent = 'Prišlo je do napake pri prijavi. Poskusite znova.';
        }
    });

});

