import { refreshProducts } from './products.js';
import {baseUrl} from "../config.js";
export function createEditStockModal() {
    const modalHTML = `
        <div class="modal fade" id="editStockModal" tabindex="-1" aria-labelledby="editStockModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editStockModalLabel">Edit Stock</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editStockForm">
                            <div class="mb-3">
                                <label for="newStockCount" class="form-label">New Stock Count</label>
                                <input type="number" class="form-control" id="newStockCount" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Save</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

(function initializeEditStockModal() {
    createEditStockModal();
})();

export function openEditStockModal(productId, currentStock) {
    const modal = new bootstrap.Modal(document.getElementById('editStockModal'));
    const newStockInput = document.getElementById('newStockCount');
    newStockInput.value = currentStock;

    const form = document.getElementById('editStockForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        const newStock = parseInt(newStockInput.value, 10);

        if (isNaN(newStock) || newStock < 0) {
            alert('Please enter a valid stock count.');
            return;
        }

        updateStock(productId, newStock, modal);
    };

    modal.show();
}


export function updateStock(productId, newStock, modal) {
    fetch(`${baseUrl()}/products/${productId}/update/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStock)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update stock.');
            }
            return response.json();
        })
        .then(updatedProduct => {
            alert('Stock updated successfully!');
            modal.hide();
            refreshProducts();
        })
        .catch(error => {
            alert(`Error updating stock: ${error.message}`);
            console.error('Stock update error:', error);
        });
}



