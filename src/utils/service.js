import Axios from "axios";
import { getToken, clearSession } from "../lib/auth";

const instance = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (request) => {
    const token = getToken();
    if (token) request.headers.Authorization = `Bearer ${token}`;
    // Let the browser set the multipart boundary itself for FormData bodies.
    if (request.data instanceof FormData) delete request.headers["Content-Type"];
    return request;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
