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
                                <input type="text" id="cardNumber" class="form-control" placeholder="1234 5678 9101 1121" maxlength="16" required />
                            </div>
                            <div class="mb-3">
                                <label for="cardHolder" class="form-label">Cardholder Name:</label>
                                <input type="text" id="cardHolder" class="form-control" placeholder="John Doe" required />
                            </div>
                            <div class="mb-3">
                                <label for="expiryDate" class="form-label">Expiry Date:</label>
                                <input type="text" id="expiryDate" class="form-control" placeholder="MM/YY" maxlength="4" required />
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

    // Add toast HTML for notifications
    const toastDiv = document.createElement("div");
    toastDiv.id = "toastContainer";
    toastDiv.className = "position-fixed bottom-0 end-0 p-3";
    toastDiv.style.zIndex = "1055";
    toastDiv.innerHTML = `
        <div id="paymentToast" class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    Payment successful! Redirecting to products...
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    document.body.appendChild(toastDiv);

    // Initialize modal
    const paymentModal = new bootstrap.Modal(document.getElementById("paymentModal"));
    paymentModal.show();

    // Add the event listener after the modal has been added to the DOM
    document.getElementById('payButton').addEventListener('click', validatePayment);

    // Reset the form when modal is closed
    document.getElementById('paymentModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('payment-form').reset(); // Reset form fields
        document.getElementById('paymentStatus').innerHTML = ''; // Clear any payment status message
    });
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

    let orderId;

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

            return response.json();
        })
        .then(orderData => {
            orderId = orderData.id;

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
        })
        .then(() => {
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

            const toastElement = document.getElementById("paymentToast");
            const toast = new bootstrap.Toast(toastElement);
            toast.show();

            const paymentModal = bootstrap.Modal.getInstance(document.getElementById("paymentModal"));
            paymentModal.hide();

            setTimeout(() => {
                window.location.hash = "#products";
            }, 2000);
        })
        .catch(error => {
            showPaymentStatus(error.message, "danger");
        });
}

function showPaymentStatus(message, type) {
    const statusDiv = document.getElementById("paymentStatus");
    statusDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}
