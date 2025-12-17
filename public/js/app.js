const API_URL = '/api';

const Auth = {
    async check() {
        try {
            const res = await fetch(`${API_URL}/me`);
            if (res.ok) {
                const data = await res.json();
                return data.user;
            }
            return null;
        } catch (e) {
            return null;
        }
    },

    async login(email, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return res.json();
    },

    async register(fullName, email, password) {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password }),
        });
        return res.json();
    },

    async logout() {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
        window.location.href = '/index.html';
    }
};

const UI = {
    updateNav(user) {
        const navLinks = document.querySelector('.nav-links');
        if (user) {
            let links = `
                <a href="/dashboard.html">Dashboard</a>
                <a href="#" onclick="Auth.logout()">Logout</a>
            `;
            if (user.role === 'admin') {
                links = `<a href="/admin.html">Admin Panel</a>` + links;
                links = `<a href="/admin-users.html">Admin Users</a>` + links;
            }
            navLinks.innerHTML = links;
        } else {
            navLinks.innerHTML = `
                <a href="/login.html" class="btn btn-outline">Login</a>
                <a href="/register.html" class="btn btn-primary">Join Now</a>
            `;
        }
    },

    showError(message) {
        alert(message);
    }
};

// start app
document.addEventListener('DOMContentLoaded', async () => {
    const user = await Auth.check();
    UI.updateNav(user);


    // mobile menu toggle
    const menu = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menu) {
        menu.addEventListener('click', () => {
            menu.classList.toggle('is-active');
            navLinks.classList.toggle('active');
        });
    }
});
