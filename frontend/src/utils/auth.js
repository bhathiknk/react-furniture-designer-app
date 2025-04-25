

export function saveToken(token) {
    localStorage.setItem('token', token);
}


export function logout() {
    localStorage.removeItem('token');
}
