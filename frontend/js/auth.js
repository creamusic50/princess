const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

class Auth {
    constructor() {
        // Support legacy key `authToken` as well as `token`
        this.token = localStorage.getItem('token') || localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.init();
    }
    
    init() {
        this.updateAuthUI();
        this.checkTokenExpiry();
    }
    
    isLoggedIn() {
        return !!(this.token && this.user);
    }
    
    isAdmin() {
        return this.isLoggedIn() && this.user.role === 'admin';
    }
    
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.setAuth(data.token, data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Connection error' };
        }
    }
    
    async register(username, email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.setAuth(data.token, data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Connection error' };
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        this.updateAuthUI();
        
        // Redirect to home if not already there
        if (!window.location.pathname.includes('index.html') && 
            !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
    }
    
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        
        // Store under both keys for compatibility with older scripts
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.updateAuthUI();
    }
    
    updateAuthUI() {
        const authLinks = document.getElementById('auth-links');
        const userInfo = document.getElementById('user-info');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');
        
        if (!authLinks || !userInfo) return;
        
        if (this.isLoggedIn()) {
            authLinks.style.display = 'none';
            userInfo.style.display = 'flex';
            
            if (userEmail) {
                userEmail.textContent = this.user.email;
            }
            
            if (userAvatar) {
                userAvatar.textContent = this.user.username.charAt(0).toUpperCase();
            }
            
            // Update admin links
            this.updateAdminLinks();
        } else {
            authLinks.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }
    
    updateAdminLinks() {
        const adminLinks = document.querySelectorAll('.admin-link');
        const adminOnly = document.querySelectorAll('.admin-only');
        
        if (this.isAdmin()) {
            adminLinks.forEach(link => link.style.display = 'block');
            adminOnly.forEach(el => el.style.display = 'block');
        } else {
            adminLinks.forEach(link => link.style.display = 'none');
            adminOnly.forEach(el => el.style.display = 'none');
        }
    }
    
    async checkTokenExpiry() {
        if (!this.token) return;
        
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'x-auth-token': this.token
                }
            });
            
            if (!response.ok) {
                // Token expired or invalid
                this.logout();
            }
        } catch (error) {
            console.error('Token check error:', error);
        }
    }
    
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-auth-token': this.token
        };
    }
    
    async refreshToken() {
        if (!this.token) return null;
        
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.setAuth(data.token, data.user);
                return data.token;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }
        
        return null;
    }
    
    requireAuth(redirectUrl = 'user-login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
    
    requireAdmin(redirectUrl = 'index.html') {
        if (!this.isAdmin()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// Create global auth instance
const auth = new Auth();
window.auth = auth;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = auth;
}

// Update UI on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.updateAuthUI();
});