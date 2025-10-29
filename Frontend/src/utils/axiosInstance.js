import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  (response) => response, // pass through if success
  (error) => {
    let message = "Something went wrong. Please try again.";

    if (error.response) {
      // Server responded with non-2xx status
      const status = error.response.status;
      const data = error.response.data;

      if (status >= 500) {
        message = "Server error. Please try later.";
      } else if (status === 404) {
        message = "Requested resource not found.";
      } else if (status === 400) {
        message = data?.message || data?.msg || "Bad request. Check input.";
      } else if (status === 401) {
        message = "Unauthorized. Please login again.";
      } else {
        message = data?.message || data?.msg || message;
      }
    } else if (error.request) {
      // No response (network error or timeout)
      message = "No response from server. Check your connection.";
    } else {
      // Error setting up the request
      message = error.message || message;
    }

    // Attach readable message for components
    return Promise.reject({ ...error, friendlyMessage: message });
  }
);

export default axiosInstance;
