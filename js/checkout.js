export function renderPaymentForm() {
    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = `
        <div class="modal fade" id="paymentModal" tabindex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="paymentModalLabel">Payment Information</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="payment-form">
                            <div class="mb-3">
                                <label for="cardNumber" class="form-label">Card Number:</label>
                                <input type="text" id="cardNumber" class="form-control" placeholder="1234 5678 9101 1121" maxlength="19" required />
                            </div>
                            <div class="mb-3">
                                <label for="cardHolder" class="form-label">Cardholder Name:</label>
                                <input type="text" id="cardHolder" class="form-control" placeholder="John Doe" required />
                            </div>
                            <div class="mb-3">
                                <label for="expiryDate" class="form-label">Expiry Date:</label>
                                <input type="text" id="expiryDate" class="form-control" placeholder="MM/YY" maxlength="5" required />
                            </div>
                            <div class="mb-3">
                                <label for="cvv" class="form-label">CVV:</label>
                                <input type="password" id="cvv" class="form-control" placeholder="123" maxlength="3" required />
                            </div>
                            <button type="button" id="payButton" class="btn btn-primary">Pay Now</button>
                        </form>
                        <div id="paymentStatus" class="mt-3"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalDiv);

    // Initialize modal
    const paymentModal = new bootstrap.Modal(document.getElementById("paymentModal"));
    paymentModal.show();

    // Add the event listener after the modal has been added to the DOM
    document.getElementById('payButton').addEventListener('click', validatePayment);
}

function validatePayment() {
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardHolder = document.getElementById('cardHolder').value.trim();
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    const paymentPayload = {
        cardNumber: cardNumber,
        cardHolder: cardHolder,
        expiryDate: expiryDate,
        cvv: cvv
    };

    const token = localStorage.getItem('token');
    if (!token) {
        showPaymentStatus("User token not found. Please log in.", "danger");
        return;
    }

    // Fetch the current order ID
    fetch('http://localhost:8080/api/v1/order/active', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to fetch active order");
            }

            // Check if the response has content and is JSON
            return response.text().then(text => {
                if (text) {
                    try {
                        return JSON.parse(text); // Attempt to parse JSON
                    } catch (e) {
                        throw new Error("Invalid JSON response from server");
                    }
                }
                throw new Error("Empty response from the server");
            });
        })
        .then(orderData => {
            const orderId = orderData.id;

            // Proceed with payment validation
            return fetch('http://localhost:8080/api/v1/order/validatePayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(paymentPayload),
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to verify payment");
            }

            // Check if the response has content and is JSON
            return response.text().then(text => {
                if (text) {
                    try {
                        return JSON.parse(text); // Attempt to parse JSON
                    } catch (e) {
                        throw new Error("Invalid JSON response during payment verification");
                    }
                }
                throw new Error("Empty response from the server during payment verification");
            });
        })
        .then(() => {
            // Proceed with checkout
            return fetch(`http://localhost:8080/api/v1/order/checkout/${orderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Checkout failed");
            }
            return response.text();
        })
        .then(message => {
            showPaymentStatus(message, "success");
        })
        .catch(error => {
            showPaymentStatus(error.message, "danger");
        });
}

// Helper function to display payment status messages
function showPaymentStatus(message, type) {
    const statusDiv = document.getElementById("paymentStatus");
    statusDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}
