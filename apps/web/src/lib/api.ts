import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor that injects the Bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor that handles auth failures and genericizes 5xx errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
        }
        if (error.response?.status >= 500) {
            error.response.data = { message: 'Ocurrió un error inesperado. Intentá de nuevo.' };
        }
        return Promise.reject(error);
    }
);