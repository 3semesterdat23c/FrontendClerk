// cart.js
export async function addToCart(productId) {
    try {
        const token = localStorage.getItem('token'); // Use 'token' if it's stored under this key
        console.log('Token retrieved:', token); // Log the token to ensure it's available

        if (!token) {
            alert('You must be logged in to add items to the cart.');
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Add token to the headers
        };

        const response = await fetch('http://localhost:8080/api/v1/order/cart', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                productId: productId,
                quantity: 1, // Default quantity; adjust as needed
            }),
        });

        if (response.ok) {
            // Optionally, provide feedback to the user
            alert('Product added to cart successfully!');
            const data = await response.json(); // You can access response data if needed
            console.log('Server response:', data);
        } else {
            let errorMessage = 'Unknown error occurred.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || 'An error occurred.';
            }
            alert(`Failed to add product to cart: ${errorMessage}`);
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('An error occurred while adding the product to the cart.');
    }
}


export async function loadCart() {
    // Function to load and display the cart contents
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/cart', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const cartData = await response.json();
            renderCart(cartData);
        } else {
            const errorData = await response.json();
            alert(`Failed to load cart: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        alert('An error occurred while loading the cart.');
    }
}

function renderCart(cartData) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <h2>Your Cart</h2>
        <div id="cart-items">
            ${cartData.orderProducts.map(item => `
                <div class="cart-item">
                    <p><strong>Product:</strong> ${item.product.name}</p>
                    <p><strong>Price:</strong> $${item.product.price}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <button class="btn btn-danger remove-from-cart-button" data-product-id="${item.product.productId}">Remove</button>
                </div>
            `).join('')}
        </div>
    `;

    // Attach event listeners to "Remove" buttons
    attachRemoveFromCartListeners();
}

function attachRemoveFromCartListeners() {
    const cartItemsContainer = document.getElementById('cart-items');

    cartItemsContainer.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('remove-from-cart-button')) {
            event.preventDefault();
            const productId = event.target.getAttribute('data-product-id');
            removeFromCart(productId);
        }
    });
}

export async function removeFromCart(productId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/cart/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                productId: productId,
            }),
        });

        if (response.ok) {
            // Refresh the cart display
            loadCart();
        } else {
            const errorData = await response.json();
            alert(`Failed to remove product from cart: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error removing product from cart:', error);
        alert('An error occurred while removing the product from the cart.');
    }
}
