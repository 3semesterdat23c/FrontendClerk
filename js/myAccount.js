import { parseJwt, searchNextAdmin, checkAdmin } from "./admin.js";
import { baseUrl } from "./config.js";
import { showOrderModal } from "./myOrderModal.js";

export function loadmyAccount() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token')
    const string = parseJwt(user);
    const email = string["sub"];
    fetch(`${baseUrl()}/users/${email}/user`)
        .then(response => response.json())
        .then(user => {
            const id = user.userId;
            displayUserForm(user, id);
            loadOrders();
        })
        .catch(error => {
            console.error('Error fetching user:', error);
            resultMessage.textContent = 'User not found or an error occurred.';
        });

    function displayUserForm(user, id) {
        const app = document.getElementById('app');

        app.innerHTML = `
<link rel="stylesheet" href="css/myAccount.css">
<br>
<br>
<br>
<div class="container">
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
   
   <div class="form-section" id="myOrders">
       <h3>My Orders</h3>
       <ul id="orderList"></ul>
   </div>
</div>

<div id="appAdmin" class="container"></div>
    `;

        if (checkAdmin() === true) {
            searchNextAdmin();
        }

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

            fetch(`${baseUrl()}/users/${id}/update`, {
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
            event.preventDefault();
            const password = document.getElementById('password').value;
            const passwordConfirmation = document.getElementById('password-confirmation').value;
            if (password) {
                if (password === passwordConfirmation) {
                    const updatedUser = {
                        password: password,
                    };
                    fetch(`${baseUrl()}/users/${id}/update`, {
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
            } else {
                formMessagePassword.textContent = 'You need to type a password';
            }
        });
    }

    function formatDate(unixTimestamp) {
        const date = new Date(unixTimestamp);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }

    function getOrderTotalPrice(order) {
        let totalPrice = 0;

        order.orderProducts.forEach(orderProduct => {
            totalPrice += orderProduct.priceAtTimeOfOrder * orderProduct.quantity;
        });

        return totalPrice.toFixed(2);
    }

    function getOrderTotalItems(order) {
        let totalItems = 0;
        order.orderProducts.forEach(orderProduct => {
            totalItems += orderProduct.quantity;
        });

        return totalItems;

    }

    function loadOrders() {
        fetch(`${baseUrl()}/order/myOrders`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(orders => {
                const orderList = document.getElementById('orderList');
                orderList.innerHTML = '';

                if (orders.length > 0) {
                    orders.forEach(order => {
                        const listItem = document.createElement('li');
                        listItem.textContent = `Order ID: ${order.id} | Order date: ${formatDate(order.orderDate)} | Total: ${getOrderTotalPrice(order)} | No. of items: ${getOrderTotalItems(order)}`;

                        listItem.addEventListener('click', function() {
                            showOrderModal(order);
                        });

                        listItem.classList.add('clickable');
                        orderList.appendChild(listItem);

                        orderList.appendChild(listItem);
                    });
                } else {
                    orderList.innerHTML = '<li>No orders found.</li>';
                }
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                const orderList = document.getElementById('orderList');
                orderList.innerHTML = '<li>Error loading orders.</li>';
            });
    }
}