import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = window.__accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (original.url?.includes("/api/v1/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post(
          "/api/v1/auth/refresh",
          {},
          { withCredentials: true },
        );

        window.__accessToken = data.accessToken;
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        window.__accessToken = null;
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
