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
            // 1. Fetch the profile data
            const response = await fetch('js/data/profiles.json');
            
            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const profiles = await response.json();
            
            // 2. Check if the entered ID exists in the data
            const userProfile = profiles.find(profile => profile.id === enteredId);

            if (userProfile) {
                // SUCCESS: ID is correct
                
                // Optional: Store the ID or profile data in local storage/session storage 
                // so the profile page can access it.
                sessionStorage.setItem('loggedInUserId', enteredId); 

                // 3. Redirect to the profile page
                // The profile page will use the stored ID to load the correct data
                window.location.href = `profile.html?id=${enteredId}`; 

            } else {
                // FAILURE: ID is incorrect
                errorMessage.textContent = 'Identifikacijska številka ni pravilna.';
            }

        } catch (error) {
            console.error('Napaka pri prijavi ali nalaganju podatkov:', error);
            errorMessage.textContent = 'Prišlo je do napake pri prijavi. Poskusite znova.';
        }
    });
});