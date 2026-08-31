import axios from "axios";
import apiConfig from "../config/apiConfig";
import { refreshAccessToken } from "./refreshToken";

const axiosIdentityInstance = axios.create({
  baseURL: apiConfig.IdentityURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// Request Interceptor
// =========================
axiosIdentityInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// =========================
// Response Interceptor
// =========================
axiosIdentityInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("Auth/refreshlogin")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return axiosIdentityInstance(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default axiosIdentityInstance;