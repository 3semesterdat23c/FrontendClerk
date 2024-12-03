import { parseJwt  } from "./admin.js";
export function loadmyAccount() {
    const token =localStorage.getItem('user');
    const string = parseJwt(token)
    console.log(string)
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
        const app = document.getElementById('app'); // Assuming the main container has the ID 'app'.

        // Create the form dynamically
        app.innerHTML = `
        <h3>Edit User Information</h3>
        <form id="user-edit-form">
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" value="${user.firstName}" />

            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" value="${user.lastName}" />

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="${user.userEmail}" />

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" value="12345"/>

            <button type="button" id="save-button">Save Changes</button>
        </form>
        <p id="form-message"></p>
    `;

        // Add a save button listener
        const saveButton = document.getElementById('save-button');
        const formMessage = document.getElementById('form-message');
        saveButton.addEventListener('click', () => {
            const updatedUser = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
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
    }
}

