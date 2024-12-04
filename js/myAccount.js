import {parseJwt, searchNextAdmin, checkAdmin} from "./admin.js";

export function loadmyAccount() {
    const token = localStorage.getItem('user');
    const string = parseJwt(token)
    const email = string["sub"]
    fetch(`http://localhost:8080/api/v1/users/${email}/user`) // Fetch user information
        .then(response => response.json())
        .then(user => {
            const id = user.userId
            displayUserForm(user, id);
        })
        .catch(error => {
            // Handle errors, e.g., user not found
            console.error('Error fetching user:', error);
            resultMessage.textContent = 'User not found or an error occurred.';
        });

    function displayUserForm(user, id) {
        const app = document.getElementById('app'); // Assuming the main container has the ID 'app'

        // Create the form dynamically
        app.innerHTML = `
<link rel="stylesheet" href="css/myAccount.css">
<br>
<br>
<br>
<div class="container">
    <!-- Edit User Information -->
    <div class="form-section"><h3>Edit User Information</h3>
        <form id="user-edit-form">
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" value="${user.firstName}" />

            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" value="${user.lastName}" />

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${user.userEmail}" />

            <button type="button" id="save-button">Save Changes</button>
        </form>
        <br>
        <p id="form-message"></p>
    </div>

    <!-- Edit Your Password -->
    <div class="form-section">
         <h3>Edit Your Password</h3>
        <form id="password-edit-form">
      
            <label for="password">New password:</label>
            <input type="password" id="password" name="password"/>
            
            <label for="password">Confirm new password:</label>
            <input type="password" id="password-confirmation" name="password-confirmation"/>

            <button type="button" id="save-button-password">Save Changes</button>
        </form>
        <br>
        <p id="form-message-password"></p>
   </div>
 
</div>
  

<div id="appAdmin" class="container"></div>
    `;
        if (checkAdmin()===true){
        searchNextAdmin()}
        // Add a save button listener
        const saveButton = document.getElementById('save-button');
        const saveButtonPassword = document.getElementById('save-button-password');
        const formMessage = document.getElementById('form-message');
        const formMessagePassword = document.getElementById('form-message-password');
        saveButton.addEventListener('click', () => {
            const updatedUser = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
            };

            // Call an API to update the user (if implemented)
            fetch(`http://localhost:8080/api/v1/users/${id}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            })
                .then(response => {
                    if (response.ok) {
                        formMessage.textContent = 'User updated successfully!';
                    } else {
                        throw new Error('Failed to update user.');
                    }
                })
                .catch(error => {
                    console.error('Error updating user:', error);
                    formMessage.textContent = 'An error occurred while updating the user.';
                });
        });

        saveButtonPassword.addEventListener('click', () => {
            event.preventDefault()
            const password = document.getElementById('password').value
            const passwordConfirmation = document.getElementById('password-confirmation').value
            if (password){
            if (password === passwordConfirmation) {
                const updatedUser = {
                    password: password,
                };
                fetch(`http://localhost:8080/api/v1/users/${id}/updatepassword`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedUser),
                })
                    .then(response => {
                        if (response.ok) {
                            formMessagePassword.textContent = 'Password updated successfully!';
                        } else {
                            throw new Error('Failed to update password.');
                        }
                    })
                    .catch(error => {
                        console.error('Error updating user:', error);
                        formMessagePassword.textContent = 'An error occurred while updating the password.';
                    });
            } else {
                formMessagePassword.textContent = 'Passwords not matching';
            }
            }else {formMessagePassword.textContent = 'You need to type a password';}
        })

    }
}

