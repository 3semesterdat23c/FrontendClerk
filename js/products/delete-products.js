import {loadProducts} from "./products.js";

export function deleteProduct(productId) {
    // Confirm deletion with the user
    const confirmation = confirm("Are you sure you want to delete this product?");
    if (!confirmation) {
        return; // Exit if the user cancels
    }

    // Show a loading indicator or disable the delete button (optional)
    // You can enhance user experience by providing feedback here

    fetch(`http://localhost:8080/api/v1/products/${productId}/delete`, {
        method: 'DELETE',
        // headers: {
        //     'Authorization': `Bearer ${yourAuthToken}` // Include if authentication is required
        // },
    })
        .then(response => {
            if (response.ok) {
                return response.text(); // Or response.json() if the response is JSON
            } else if (response.status === 404) {
                throw new Error('Product not found.');
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        })
        .then(message => {
            alert(message); // Inform the user of successful deletion
            // Refresh the current page of products
            // Extract the current page from the URL hash
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const currentPage = parseInt(urlParams.get('page')) || 0;
            loadProducts(currentPage, 12);
        })
        .catch(error => {
            alert(`Failed to delete product: ${error.message}`);
            console.error('Delete product error:', error);
        });
}
