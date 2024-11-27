export function loadProducts() {
    console.log('loadProducts function called');
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Products Page</h1>
        <p>Here are our products.</p>
    `;
}