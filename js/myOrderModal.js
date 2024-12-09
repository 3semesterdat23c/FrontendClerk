export function createMyOrderModal() {
    // Modal HTML structure with a table for displaying products, quantities, and prices
    const myOrderModal = `
        <div class="modal fade" id="myOrderModal" tabindex="-1" aria-labelledby="myOrderModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="myOrderModalLabel">Order Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Product</th>
                                    <th scope="col">Quantity</th>
                                    <th scope="col">Price</th>
                                </tr>
                            </thead>
                            <tbody id="orderProductsList">
                                <!-- Products will be dynamically added here -->
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    return myOrderModal;
}

// Append the Product Modal to the body
(function initializeMyOrderModal() {
    const modalHTML = createMyOrderModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
})();

// Function to populate the modal with order data
export function showOrderModal(order) {
    const orderProductsList = document.getElementById('orderProductsList');
    orderProductsList.innerHTML = ''; // Clear existing products
    let totalPrice = 0;

    // Ensure that order.orderProducts contains data
    if (!order.orderProducts || order.orderProducts.length === 0) {
        console.error("No products found in this order");
        return;
    }

    // Loop through the order products and add rows to the table
    order.orderProducts.forEach(orderProduct => {
        const productRow = `
            <tr>
                <td>${orderProduct.product.title}</td>
                <td>${orderProduct.quantity}</td>
                <td>$${(orderProduct.priceAtTimeOfOrder * orderProduct.quantity).toFixed(2)}</td>
            </tr>
        `;
        orderProductsList.insertAdjacentHTML('beforeend', productRow);
        totalPrice += orderProduct.priceAtTimeOfOrder * orderProduct.quantity;
    });

    // Add the total row at the bottom
    const totalRow = `
        <tr>
            <td colspan="2" class="text-end"><strong>Total:</strong></td>
            <td><strong>$${totalPrice.toFixed(2)}</strong></td>
        </tr>
    `;
    orderProductsList.insertAdjacentHTML('beforeend', totalRow);

    // Debug: Log the total price and ensure the table is being updated
    console.log('Total Price:', totalPrice);

    // Ensure the modal is shown properly using Bootstrap
    const myOrderModal = new bootstrap.Modal(document.getElementById('myOrderModal'));
    myOrderModal.show();
}