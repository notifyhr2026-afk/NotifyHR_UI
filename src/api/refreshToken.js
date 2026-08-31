import axios from "axios";
import apiConfig from "../config/apiConfig";

let isRefreshing = false;
let refreshPromise = null;

export const clearAuthState = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRoles");
  localStorage.removeItem("userPermissions");
};

export const refreshAccessToken = async () => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    clearAuthState();
    return null;
  }

  isRefreshing = true;
  refreshPromise = axios
    .post(
      `${apiConfig.IdentityURL}/Auth/refreshlogin`,
      { token: refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then((response) => {
      const newAccessToken = response?.data?.token;

      if (!newAccessToken) {
        throw new Error("Invalid refresh token response.");
      }

      localStorage.setItem("token", newAccessToken);

      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      return newAccessToken;
    })
    .catch(() => {
      clearAuthState();
      window.location.href = "/login";
      return null;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};