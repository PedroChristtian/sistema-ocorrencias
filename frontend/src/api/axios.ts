import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = sessionStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const { data } = await axios.post("/api/auth/refresh", {
            refresh_token: refreshToken,
          });
          sessionStorage.setItem("access_token", data.access_token);
          sessionStorage.setItem("refresh_token", data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch {
          sessionStorage.clear();
          window.location.href = "/login";
        }
      } else {
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
