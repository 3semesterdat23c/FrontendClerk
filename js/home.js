export function loadHome() {
    console.log('loadHome function called');
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Home Page</h1>
        <p>Welcome to our webshop!</p>
    `;
}