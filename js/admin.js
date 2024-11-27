export function loadAdmin() {
    console.log('loadAdmin function called');
    const app = document.getElementById('app');
    app.innerHTML = `
        <h1>Admin Page</h1>
        <p>Admin functionalities go here.</p>
    `;
}