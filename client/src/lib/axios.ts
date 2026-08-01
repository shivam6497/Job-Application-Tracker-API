import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_URL as string;

const api = axios.create({
  baseURL,
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
        const { data } = await axios.post(
          `${baseURL}/api/v1/auth/refresh`,
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
