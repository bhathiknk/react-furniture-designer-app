import { jwtDecode } from 'jwt-decode';

export function saveToken(token) {
    localStorage.setItem('token', token);
}

export function getCurrentUser() {
    try {
        const token = localStorage.getItem('token');
        return token ? jwtDecode(token) : null;
    } catch {
        return null;
    }
}

export function logout() {
    localStorage.removeItem('token');
}
