// main.js

import { loadHome } from './home.js';
import { loadProducts, loadProductDetails } from './products.js';
import { loadAdmin } from './admin.js';
import { loadmyAccount } from "./myAccount.js";

// Function to parse hash and extract route and query parameters
function parseHash(hash) {
    const [route, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString);
    return { route, params };
}

// Function to handle navigation
function navigate() {
    const hash = window.location.hash.substring(1) || 'home';
    const { route, params } = parseHash(hash);

    switch (route) {
        case 'home':
            loadHome();
            break;
        case 'products':
            const page = parseInt(params.get('page')) || 0;
            loadProducts(page);
            break;
        case 'product':
            const productId = params.get('id');
            if (productId) {
                loadProductDetails(productId);
            } else {
                console.error('Product ID is missing in the URL.');
                loadProducts(); // Fallback to product list
            }
            break;
        case 'admin':
            loadAdmin();
            break;
        case 'myAccount':
            loadmyAccount();
            break;
        default:
            console.log('Unknown route, loading Home');
            loadHome();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Registration form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
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
    }

    navigate(); // Load the initial route
});

// Event listener for hash changes
window.addEventListener('hashchange', navigate);
