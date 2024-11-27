import { loadHome } from './home.js';
import { loadProducts } from './products.js';
import { loadAdmin } from './admin.js';
import { loadmyAccount } from "./myAccount.js";

// Function to handle navigation
function navigate() {
    console.log('Navigate function called');
    const hash = window.location.hash.substring(1) || 'home';
    console.log('Current hash:', hash);

    switch (hash) {
        case 'home':
            console.log('Loading Home');
            loadHome();
            break;
        case 'products':
            console.log('Loading Products');
            loadProducts();
            break;
        case 'admin':
            console.log('Loading Admin');
            loadAdmin();
            break;
        case 'myAccount':
            console.log('Loading my account')
            loadmyAccount();
            break;
        default:
            console.log('Unknown route, loading Home');
            loadHome();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Collect input values
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Construct the user data object to match UserRequestDTO
        const userRequestDTO = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password
        };

        try {
            // Make the POST request to the /register endpoint
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userRequestDTO),
            });

            // Handle the response
            if (response.ok) {
                const message = await response.text(); // Read the response body
                alert(message); // Notify the user
                $('#registerModal').modal('hide'); // Close the modal
            } else if (response.status === 409) {
                const errorMessage = await response.text();
                alert(errorMessage); // Notify the user about the conflict
            } else {
                throw new Error('Unexpected response from the server');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred while registering. Please try again later.');
        }
    });
});



// Event listener for hash changes
window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);