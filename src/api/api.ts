import axios from "axios";
import baseUrl from "../lib/constant";
console.log("Base URL:", baseUrl);

// Create axios instance
const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
});

// API functions
const createCompany = async (companyData: any) => {
  console.log("Creating company with data:", companyData);
  // return companyData;
  const res = await apiClient.post("/company/create", companyData);
  return res.data;
};

const getCompanies = async () => {
  try {
    console.log("Fetching companies...");
    const res = await apiClient.get("/company/agent/companies");
    console.log("Fetched companies:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error fetching companies:", err.response?.data || err.message);
    throw err;
  }
};
const updateCompany = async (companyId: string, companyData: any) => {
  const res=await apiClient.put(`/company/update/${companyId}`,companyData)
  return res.data
}
const deleteCompany = async (companyId: string) => {
  const res = await apiClient.delete(`/company/delete/${companyId}`);
  return res.data;
}

const getProducts = async () => {
  const res = await apiClient.get("/products");
  return res.data;
};

// Export API
const api = {
  createCompany,
  getCompanies,
  getProducts,
  updateCompany,
  deleteCompany
};

export default api;
