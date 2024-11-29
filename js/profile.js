// profile.js

import { loadmyAccount } from "./myAccount.js";

function registerModalTemplate() {
    return `
    <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 id="registerModalLabel" class="modal-title">Register</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <!-- Form Fields -->
                        <button type="submit" class="btn btn-primary">Register</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

function loginModalTemplate() {
    return `
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 id="loginModalLabel" class="modal-title">Login</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <!-- Form Fields -->
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

function logoutUser() {
    localStorage.removeItem('user');
    updateDropdownForLoggedOutState();
    alert('You have been logged out.');
}

function updateDropdownForLoggedOutState() {
    const accountDropdownContainer = document.getElementById('accountDropdownContainer');
    if (accountDropdownContainer) {
        accountDropdownContainer.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="accountDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="images/Shadowman.jpg" alt="Account" style="width: 30px; height: 30px;">
            </a>
            <ul class="dropdown-menu" aria-labelledby="accountDropdown">
                <li><button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button></li>
                <li><button class="dropdown-item" data-bs-toggle="modal" data-bs-target="#registerModal">Register</button></li>
            </ul>
        `;
    }
}

function updateUIForLoggedInUser(userData) {
    const accountDropdownContainer = document.getElementById('accountDropdownContainer');
    if (accountDropdownContainer) {
        accountDropdownContainer.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${userData.email}
                <img src="images/Shadowman.jpg" alt="User" style="width: 30px; height: 30px;">
            </a>
            <ul class="dropdown-menu" aria-labelledby="userDropdown">
                <li><button class="dropdown-item" id="myAccountButton">My Account</button></li>
                <li><button class="dropdown-item" id="logoutButton">Logout</button></li>
            </ul>
        `;

        // Attach event listeners
        document.getElementById('logoutButton')?.addEventListener('click', logoutUser);
        document.getElementById('myAccountButton')?.addEventListener('click', loadmyAccount);
    }
}

export function uiDropdownDynamicChangerForLoginAndLogout() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
        updateUIForLoggedInUser(user);
    } else {
        updateDropdownForLoggedOutState();
    }
}

function attachRegisterFormListener() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Collect input values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const userRequestDTO = { firstName, lastName, email, password };

            try {
                const response = await fetch('http://localhost:8080/api/v1/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userRequestDTO),
                });

                if (response.ok) {
                    const message = await response.text();
                    alert(message);
                    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                    registerModal.hide();
                } else if (response.status === 409) {
                    const errorMessage = await response.text();
                    alert(errorMessage);
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
            e.preventDefault();

            // Collect input values
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const loginRequestDTO = { email, password };

            try {
                const response = await fetch('http://localhost:8080/api/v1/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginRequestDTO),
                });

                if (response.ok) {
                    const resData = await response.json();
                    localStorage.setItem('user', JSON.stringify(resData));
                    alert('Login successful! Welcome, ' + loginRequestDTO.email);
                    updateUIForLoggedInUser(resData);

                    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    loginModal.hide();
                } else if (response.status === 401) {
                    const errorMessage = await response.text();
                    alert('Invalid credentials: ' + errorMessage);
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
