import {loadmyAccount} from "./myAccount.js";

function registerModalTemplate() {
    return `
    <div class="modal fade" id="registerModal" tabindex="-1" role="dialog" aria-labelledby="registerModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="registerModalLabel">Register</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="form-group">
                            <label for="firstName">First Name</label>
                            <input type="text" class="form-control" id="firstName" placeholder="Enter your first name" required>
                        </div>
                        <div class="form-group">
                            <label for="lastName">Last Name</label>
                            <input type="text" class="form-control" id="lastName" placeholder="Enter your last name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" class="form-control" id="email" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" id="password" placeholder="Enter your password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Register</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

function loginModalTemplate() {
    return `
    <div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="loginModalLabel">Login</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" class="form-control" id="loginEmail" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" class="form-control" id="loginPassword" placeholder="Enter your password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

function logoutUser() {
    // Clear user data from localStorage
    localStorage.removeItem('user');

    // Reset dropdown content for logged-out state
    const accountDropdownContainer = document.getElementById('accountDropdownContainer');
    if (accountDropdownContainer) {
        accountDropdownContainer.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="accountDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img src="images/Shadowman.jpg" alt="Account" style="width: 30px; height: 30px;">
            </a>
            <div class="dropdown-menu" aria-labelledby="accountDropdown">
                <button class="dropdown-item" data-toggle="modal" data-target="#loginModal">Login</button>
                <button class="dropdown-item" data-toggle="modal" data-target="#registerModal">Register</button>
            </div>
        `;
    }

    alert('You have been logged out.');
}

function updateUIForLoggedInUser(userData) {
    const accountDropdownContainer = document.getElementById('accountDropdownContainer');
    if (accountDropdownContainer) {
        // Replace content with logged-in dropdown
        accountDropdownContainer.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                ${userData}
                <img src="images/Shadowman.jpg" alt="User" style="width: 30px; height: 30px;">
            </a>
            <div class="dropdown-menu" aria-labelledby="userDropdown">
                <button class="dropdown-item" id="myAccountButton">My Account</button>
                <button class="dropdown-item" id="logoutButton">Logout</button>
            </div>
        `;

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                logoutUser();
            });
        }


        // Attach logout functionality
        const myAccountButton = document.getElementById('myAccountButton');
        if (myAccountButton) {
            myAccountButton.addEventListener('click', () => {

                loadmyAccount();
            });
        }
    }
}


export function uiDropdownDynamicChangerForLoginAndLogout(){
    const user = JSON.parse(localStorage.getItem('user'));
    const accountDropdownContainer = document.getElementById('accountDropdownContainer');

    if (user && user.email) {
        updateUIForLoggedInUser(user); // Show logged-in dropdown
    } else if (accountDropdownContainer) {
        accountDropdownContainer.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="accountDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img src="images/Shadowman.jpg" alt="Account" style="width: 30px; height: 30px;">
            </a>
            <div class="dropdown-menu" aria-labelledby="accountDropdown">
                <button class="dropdown-item" data-toggle="modal" data-target="#loginModal">Login</button>
                <button class="dropdown-item" data-toggle="modal" data-target="#registerModal">Register</button>
            </div>
        `;
    }
}



function attachRegisterFormListener() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            // Collect input values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Construct the user data object
            const userRequestDTO = {
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: password,
            };

            try {
                // Make the POST request to the /register endpoint
                const response = await fetch('http://localhost:8080/api/v1/register', {
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
}

function attachLoginFormListener() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            // Debugging
            console.log('Login form submitted');

            // Collect input values
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            console.log('Email:', email);

            // Construct the login data object
            const loginRequestDTO = {
                email: email,
                password: password,
            };

            try {
                // Make the POST request to the /login endpoint
                const response = await fetch('http://localhost:8080/api/v1/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginRequestDTO),
                });

                if (response.ok) {
                    const resData = await response.json(); // Parse JSON response
                    console.log('Login response:', resData);

                    // Save user data (e.g., email and token) in localStorage
                    localStorage.setItem('user', JSON.stringify(resData));
                    alert('Login successful! Welcome, ' + loginRequestDTO.email);

                    // Update UI based on login state
                    updateUIForLoggedInUser(loginRequestDTO.email);

                    $('#loginModal').modal('hide'); // Close the login modal
                } else if (response.status === 401) {
                    const errorMessage = await response.text();
                    alert('Invalid credentials: ' + errorMessage); // Notify the user
                } else {
                    const errorMessage = await response.text();
                    console.error('Unexpected response:', errorMessage);
                    alert('Unexpected error: ' + errorMessage);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred while logging in. Please try again later.');
            }
        });
    } else {
        console.error('Login form not found');
    }
}





export function injectModals() {
    const bodyElement = document.body;

    // Append Register Modal
    const registerModal = document.createElement('div');
    registerModal.innerHTML = registerModalTemplate();
    bodyElement.appendChild(registerModal.firstElementChild);

    // Append Login Modal
    const loginModal = document.createElement('div');
    loginModal.innerHTML = loginModalTemplate();
    bodyElement.appendChild(loginModal.firstElementChild);

    // Attach event listeners for the forms
    attachRegisterFormListener();
    attachLoginFormListener();
}


