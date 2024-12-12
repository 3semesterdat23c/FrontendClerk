import {loadProducts} from "./products.js";
import {baseUrl} from "../config.js";


export function deleteProduct(productId) {
    const confirmation = confirm("Are you sure you want to delete this product?");
    if (!confirmation) {
        return;
    }


    fetch(`${baseUrl()}/products/${productId}/delete`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else if (response.status === 404) {
                throw new Error('Product not found.');
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .then(message => {
            alert(message);
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const currentPage = parseInt(urlParams.get('page')) || 0;
            loadProducts(currentPage, 12);
        })
        .catch(error => {
            alert(`Failed to delete product: ${error.message}`);
            console.error('Delete product error:', error);
        });
}
