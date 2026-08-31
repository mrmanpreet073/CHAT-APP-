import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000" || VITE_BACKEND_URL, // Use the backend URL from the .env file if available
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;