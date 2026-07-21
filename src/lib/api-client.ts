import axios from "axios";

// Create a centralized Axios instance
export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding auth tokens, etc.
apiClient.interceptors.request.use((config) => {
	// Example:
	// const token = localStorage.getItem('token');
	// if (token) {
	//   config.headers.Authorization = `Bearer ${token}`;
	// }
	return config;
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
	(response) => {
		return response.data;
	},
	(error) => {
		const message = error.response?.data?.message || error.message;
		console.error("API Error:", message);

		// Example: Redirect to login if 401 Unauthorized
		// if (error.response?.status === 401) { ... }

		return Promise.reject(error);
	},
);
