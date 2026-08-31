import axios from "axios";
import apiConfig from "../config/apiConfig";
import { refreshAccessToken } from "./refreshToken";

const axiosHRInstance = axios.create({
  baseURL: apiConfig.HRserviceURL,
  headers: {
    "Content-Type": "application/json",
  },
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
  },
);

// Handle unauthorized responses
axiosHRInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosHRInstance(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default axiosHRInstance;