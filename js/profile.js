import { loadmyAccount } from "./myAccount.js";
import { navigateToProducts } from "./main.js";
import {baseUrl} from "./config.js";

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
                        <div class="mb-3">
                            <label for="registerFirstName" class="form-label">First Name</label>
                            <input type="text" class="form-control" id="registerFirstName" name="firstName" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerLastName" class="form-label">Last Name</label>
                            <input type="text" class="form-control" id="registerLastName" name="lastName" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="registerEmail" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label for="registerPassword" class="form-label">Password</label>
                            <input type="password" class="form-control" id="registerPassword" name="password" required>
                        </div>
                        <div id="registerError" class="alert alert-danger d-none" role="alert"></div>
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
                        <div class="mb-3">
                            <label for="loginEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="loginEmail" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">Password</label>
                            <input type="password" class="form-control" id="loginPassword" name="password" required>
                        </div>
                        <div id="loginError" class="alert alert-danger d-none" role="alert"></div>
                        <button type="submit" class="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
}

function logoutUser() {
    localStorage.removeItem('user');
    localStorage.clear();
    updateDropdownForLoggedOutState();
    reroute();

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

function updateUIForLoggedInUser(mail) {
    const accountDropdownContainer = document.getElementById('accountDropdownContainer');
    if (accountDropdownContainer) {
        accountDropdownContainer.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${mail}
                <img src="images/Shadowman.jpg" alt="User" style="width: 30px; height: 30px;">
            </a>
            <ul class="dropdown-menu" aria-labelledby="userDropdown">
                <li><button class="dropdown-item" id="myAccountButton">My Account</button></li>
                <li><button class="dropdown-item" id="logoutButton">Logout</button></li>
            </ul>
        `;

        document.getElementById('logoutButton')?.addEventListener('click', logoutUser);
        document.getElementById('myAccountButton')?.addEventListener('click', loadmyAccount);
    }
}

export function uiDropdownDynamicChangerForLoginAndLogout() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
        updateUIForLoggedInUser(user);
        window.location.href = "/index.html";
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
            const firstName = document.getElementById('registerFirstName').value;
            const lastName = document.getElementById('registerLastName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            const userRequestDTO = { firstName, lastName, email, password };

            try {
                const response = await fetch(`${baseUrl()}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userRequestDTO),
                });

                if (response.ok) {
                    const message = await response.text();
                    alert("Your account has been created!");
                    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                    registerModal.hide();
                    registerForm.reset();
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
                const response = await fetch(`${baseUrl()}/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginRequestDTO),
                });

                if (response.ok) {
                    const resData = await response.json();
                    localStorage.setItem('user', JSON.stringify(resData));
                    localStorage.setItem('token', resData.token);

                    const mail = loginRequestDTO.email
                    updateUIForLoggedInUser(mail);

                    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    loginModal.hide();
                    loginForm.reset();
                    reroute();

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

    const registerModal = document.createElement('div');
    registerModal.innerHTML = registerModalTemplate();
    bodyElement.appendChild(registerModal.firstElementChild);

    const loginModal = document.createElement('div');
    loginModal.innerHTML = loginModalTemplate();
    bodyElement.appendChild(loginModal.firstElementChild);

    attachRegisterFormListener();
    attachLoginFormListener();
}

function reroute() {
    navigateToProducts()
}

