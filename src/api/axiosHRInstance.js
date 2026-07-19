import axios from 'axios';
import apiConfig from '../config/apiConfig';

const axiosHRInstance = axios.create({
    baseURL: apiConfig.HRserviceURL,
    headers: {
        'Content-Type': 'application/json',
    }
});


// Attach JWT token to every request
axiosHRInstance.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Handle unauthorized responses
axiosHRInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("userRoles");
            localStorage.removeItem("userPermissions");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);


export default axiosHRInstance;