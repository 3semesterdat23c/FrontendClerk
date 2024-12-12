import {updateCartItemCount} from "./cart.js";


export async function loadOrderConfirmationView(orderId) {

    const token = localStorage.getItem('token');
    updateCartItemCount()
    if (!token) {
        window.location.hash = '#products';
        return;
    }



    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="container mt-5 d-flex justify-content-center">
            <div class="card p-4 shadow-sm" style="max-width: 500px; width: 100%;">
                <div class="card-body text-center">
                    <h2 class="card-title mb-4" style="font-weight:bold;">Order Confirmation</h2>
                    <img src="images/checkmark.png" alt="Checkmark" style="width:60px; height:60px;" class="mb-3">
                    <p class="mb-3" style="font-size:1.1em;">Thank you for your purchase!</p>
                    <p class="mb-4" style="font-size:1.1em;">Your order number is: <span class="fw-bold">${orderId}</span></p>
                    <p class="text-muted mb-4">A confirmation email has been sent to your inbox.</p>
                    <button class="btn btn-primary btn-lg" id="backToProductsButton">Back to Products</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('backToProductsButton').addEventListener('click', () => {
        window.location.hash = '#products';
    });
}
