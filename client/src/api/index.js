import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - add token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = token;
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/users/refresh`, { refreshToken });
          useAuthStore.getState().setAuth(data);
          error.config.headers.Authorization = data.accessToken;
          return api(error.config);
        } catch {
          useAuthStore.getState().clearAuth();
          window.location.href = "/login";
        }
      } else {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Generic CRUD factory
export const createApiService = (endpoint) => ({
  getAll: () => api.get(`/${endpoint}`),
  getOne: (id) => api.get(`/${endpoint}/${id}`),
  create: (data) => api.post(`/${endpoint}`, data),
  update: (id, data) => api.put(`/${endpoint}/${id}`, data),
  remove: (id) => api.delete(`/${endpoint}/${id}`),
});

// All services
export const salesApi            = createApiService("sales");
export const bouncedChecksApi    = createApiService("bouncedChecks");
export const workersExpensesApi  = createApiService("workersExpenses");
export const waybillsApi         = createApiService("waybills");
export const partialPaymentApi   = createApiService("partialPayment");
export const institutionTaxApi   = createApiService("institutionTax");
export const salesToCompaniesApi = createApiService("salesToCompanies");
export const expensesApi         = createApiService("expenses");
export const sleevesBidsApi      = createApiService("sleevesBids");
export const bidsApi             = createApiService("bids");
export const companiesApi        = createApiService("companies");
export const inventoriesApi      = createApiService("inventories");
export const providersApi        = createApiService("providers");
export const contactsApi         = createApiService("contacts");
export const eventsApi           = createApiService("events");

export const taxValuesApi = {
  get: () => settingsApi.get(),
  upsert: (data) => settingsApi.update(data),
};

export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
  updateSecurity: (data) => api.put("/settings/security", data),
  // ✅ تغيير — responseType arraybuffer لاستقبال ملف ZIP
  backup: () => api.get("/settings/backup", { responseType: "arraybuffer" }),
  sendBackup: () => api.post("/settings/send-backup"),
};

export const usersApi = {
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/users/logout"),
  getMe: () => api.get("/users/me"),
  getAll: () => api.get("/users"),
  create: (data) => api.post("/users/register", data),
  update: (data) => api.put("/users", data),
  remove: (data) => api.delete("/users", { data }),
};
