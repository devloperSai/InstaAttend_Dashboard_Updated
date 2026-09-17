import axios from "axios";
import { apiUrl } from "./apiUrl";

const axiosInstance = axios.create({
  baseURL: apiUrl.baseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding token + organization id
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Every authenticated request must carry the org context returned
    // at login (user.organization_id) so the backend can scope data
    // correctly. Read fresh from localStorage on every request instead
    // of caching it in module state, since it can change on a fresh
    // login without a full page reload.
    const organizationId = localStorage.getItem("organization_id");
    if (organizationId) {
      config.headers["X-Organization-Id"] = organizationId;
    }

    // If the payload is FormData (file uploads, multipart forms),
    // let the browser set the Content-Type + boundary itself.
    // Manually setting 'multipart/form-data' (or leaving the default
    // 'application/json') breaks the multipart body server-side and
    // causes a 500 from the backend's parser.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isLoginRequest = error.config?.url === apiUrl.auth.login;

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("organization_id");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const apiClient = {
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  patch: (url, data, config) => axiosInstance.patch(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),
};
