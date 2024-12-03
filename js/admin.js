export function checkAdmin(){
    const token =localStorage.getItem('user');
    if (token){
        const jsonString = JSON.stringify(parseJwt(token));
        return jsonString.includes('true');
    }
    return false
}
export function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);

}
function makeAdmin(email){
    fetch(`http://localhost:8080/api/v1/users/${email}/setadmin`, {
        method: 'PUT',
    })
        .then(response => {
            if (response.ok) {
                return response.text(); // Or response.json() if the response is JSON
            } else if (response.status === 404) {
                throw new Error('User not found.');
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
}
export function searchNextAdmin() {
    const app = document.getElementById('app'); // Ensure you have a valid `app` element.
    app.innerHTML = `
        <div>
            <label for="admin-email">Enter email to make admin:</label>
            <input type="email" id="admin-email" placeholder="Enter email" required />
            <button id="make-admin-btn" class="btn btn-primary">Make Admin</button>
        </div>
        <p id="result-message"></p>
    `;

    const button = document.getElementById('make-admin-btn');
    const emailInput = document.getElementById('admin-email');
    const resultMessage = document.getElementById('result-message');
    button.addEventListener('click', () => {
        const email = emailInput.value;
        // ... (existing code)
        if (!email) {
            resultMessage.textContent = 'Please enter a valid email.';
            return;
        }

        fetch(`http://localhost:8080/api/v1/users/${email}/user`) // Fetch user information
            .then(response => response.json())
            .then(user => {
                showModal(user);

                // Only proceed with making the user admin if the user confirms
                if (confirm(`Are you sure you want to make ${user.firstName} ${user.lastName} an admin?`)) {
                    makeAdmin(email)
                }
            })
            .catch(error => {
                // Handle errors, e.g., user not found
                console.error('Error fetching user:', error);
                resultMessage.textContent = 'User not found or an error occurred.';
            });
    });
}


function showModal(user) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
    <div class="modal-content">
      <p>Are you sure you want to make the following user an admin?</p>
      <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <button id="confirm-btn">Confirm</button>
      <button id="cancel-btn">Cancel</button>
    </div>
  `;
    document.body.appendChild(modal);
}

