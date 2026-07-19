import axios from "axios";
import apiConfig from "../config/apiConfig";

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
  (error) => Promise.reject(error)
);

// =========================
// Response Interceptor
// =========================
axiosIdentityInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Ignore if there is no request config
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Don't refresh the refresh request itself
    if (originalRequest.url?.includes("Auth/refreshlogin")) {
      return Promise.reject(error);
    }

    // Handle expired access token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Refresh token not found.");
        }

        const refreshResponse = await axios.post(
          `${apiConfig.IdentityURL}Auth/refreshlogin`,
          {
            token: refreshToken,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const newAccessToken = refreshResponse.data.token;

        if (!newAccessToken) {
          throw new Error("Invalid refresh token response.");
        }

        // Save new access token
        localStorage.setItem("token", newAccessToken);

        // Save new refresh token if backend returns one
        if (refreshResponse.data.refreshToken) {
          localStorage.setItem(
            "refreshToken",
            refreshResponse.data.refreshToken
          );
        }

        // Update Authorization header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original request
        return axiosIdentityInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed → clear session
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userRoles");
        localStorage.removeItem("userPermissions");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosIdentityInstance;
