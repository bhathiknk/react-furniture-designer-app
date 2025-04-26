import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import API from '../utils/api';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const navigate = useNavigate();

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await API.post('/auth/register', form);
            await Swal.fire({
                icon: 'success',
                title: 'Registration successful',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/login');
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Registration failed',
                text: err.response?.data?.error || 'Please try again'
            });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        style={styles.input}
                        required
                    />
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        type="email"
                        style={styles.input}
                        required
                    />
                    <input
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        type="password"
                        style={styles.input}
                        required
                    />
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="user">Customer</option>
                        <option value="admin">Designer</option>
                    </select>
                    <button type="submit" style={styles.button}>
                        Sign Up
                    </button>
                </form>
                <p style={styles.linkText}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>
                        Sign In here
                    </Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(145deg,#e0f7fa,#e8f5e9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: `'Segoe UI','Helvetica Neue',Arial,sans-serif`
    },
    card: {
        background: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        marginBottom: '24px',
        textAlign: 'center',
        color: '#34495e',
        fontSize: '24px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    input: {
        padding: '12px',
        fontSize: '16px',
        borderRadius: '8px',
        border: '1px solid #ccc'
    },
    button: {
        background: 'linear-gradient(135deg,#4a90e2,#357abd)',
        color: '#fff',
        padding: '12px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    linkText: {
        marginTop: '16px',
        textAlign: 'center',
        fontSize: '14px'
    },
    link: {
        color: '#4a90e2',
        textDecoration: 'none',
        fontWeight: 500
    }
};
