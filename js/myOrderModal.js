export function createMyOrderModal() {
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

(function initializeMyOrderModal() {
    const modalHTML = createMyOrderModal();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
})();

export function showOrderModal(order) {
    const orderProductsList = document.getElementById('orderProductsList');
    orderProductsList.innerHTML = ''; // Clear existing products
    let totalPrice = 0;

    if (!order.orderProducts || order.orderProducts.length === 0) {
        console.error("No products found in this order");
        return;
    }

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

    const totalRow = `
        <tr>
            <td colspan="2" class="text-end"><strong>Total:</strong></td>
            <td><strong>$${totalPrice.toFixed(2)}</strong></td>
        </tr>
    `;
    orderProductsList.insertAdjacentHTML('beforeend', totalRow);



    const myOrderModal = new bootstrap.Modal(document.getElementById('myOrderModal'));
    myOrderModal.show();
}