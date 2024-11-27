export function loadmyAccount() {
    console.log('load my account function called');
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>My account page</h1>
        <p>Welcome to our webshop!</p>
    `;
}