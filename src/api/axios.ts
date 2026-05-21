import { ENV } from "@/config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Log the base URL being used
console.log('📡 Axios configured with baseURL:', ENV.API_BASE_URL);

// Reactotron API logging functions
let logApiRequest: any;
let logApiResponse: any;
let logApiError: any;

if (__DEV__) {
  try {
    const ReactotronConfig = require("@/config/ReactotronConfig");
    logApiRequest = ReactotronConfig.logApiRequest;
    logApiResponse = ReactotronConfig.logApiResponse;
    logApiError = ReactotronConfig.logApiError;
  } catch (e) {
    // Reactotron not available
  }
}

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log API request in both dev and production for debugging
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      data: config.data,
    });

    // Log API request in Reactotron (dev only)
    if (__DEV__ && logApiRequest) {
      logApiRequest(config.method || "GET", config.url || "", config.data);
    }

    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // Log API response in both dev and production for debugging
    console.log('✅ API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      dataPreview: JSON.stringify(response.data).substring(0, 200),
    });

    // Log API response in Reactotron (dev only)
    if (__DEV__ && logApiResponse) {
      logApiResponse(
        response.config.method || "GET",
        response.config.url || "",
        response.status,
        response.data,
      );
    }
    return response;
  },
  async (error) => {
    // Enhanced error logging for production debugging
    // But suppress the noisy server 500 complaining about missing franchiseId
    // for the /all-product endpoint — the client handles that case specially.
    const url = error.config?.url || '';
    const serverMsg = error.response?.data?.message || '';
    const isMissingFranchiseIdError = typeof serverMsg === 'string' && serverMsg.toLowerCase().includes('franchiseid') && url.includes('/all-product');

    if (!isMissingFranchiseIdError) {
      console.error('❌ API Error:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      });
    } else {
      // Keep a concise debug log so developers can see the server response when needed
      console.log('⚠️ Backend/all-product rejected request: missing franchiseId (handled by client)');
    }

    // Log API error in Reactotron (dev only)
    if (__DEV__ && logApiError) {
      logApiError(
        error.config?.method || "GET",
        error.config?.url || "",
        error.response?.status || 0,
        error.response?.data || error.message,
      );
    }

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

export { api };
