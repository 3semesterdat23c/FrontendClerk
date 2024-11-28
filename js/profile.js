export function registerModalTemplate() {
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

export function loginModalTemplate() {
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

export function attachRegisterFormListener() {
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
}

export function attachLoginFormListener() {
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
            console.log('Password:', password);

            // Construct the login data object
            const loginRequestDTO = {
                email: email,
                password: password,
            };

            try {
                // Make the POST request to the /login endpoint
                const response = await fetch('http://localhost:8080/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginRequestDTO),
                });

                // Handle the response
                if (response.ok) {
                    const message = await response.text(); // Read the response body
                    alert('Login successful: ' + message); // Notify the user of successful login
                    console.log('Login response:', message);
                    $('#loginModal').modal('hide'); // Close the login modal
                } else if (response.status === 401) {
                    const errorMessage = await response.text();
                    alert('Invalid credentials: ' + errorMessage); // Notify the user about invalid credentials
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


