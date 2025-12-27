import axios from "axios";
import baseUrl from "../lib/constant";
import { useAuthStore } from "../../store/authStore";
import { create } from "zustand";
// Create axios instance
const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    // "Content-Type": "application/json",
        "auth-source": "api",

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
        "auth-source": "api",
      };
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const msg = error?.response?.data?.message;

    const authStore = useAuthStore.getState();
    if (error.response?.status === 401 && msg?.includes("another device")) {
      authStore.setNewDeviceLogin(true);
    }
    if (error.response?.status === 401) {
      authStore.logout();
    }
    return Promise.reject(error);
  }
);
//Create user Api

const createUser = async (userData: any) => {
  const res = await apiClient.post("/auth/register", userData);
  return res.data;
};

//Fetch users for agent

const fetchUsers = async ({ queryParams }: { queryParams: string }) => {
  const res = await apiClient.get(
    `/user-management/client/allUsers?${queryParams}`
  );
  return res.data;
};

// API functions
const createCompany = async (companyData: any) => {
  // return companyData;
  const res = await apiClient.post("/company/create", companyData);
  return res.data;
};
const updateUser = async (id, user) => {
  const res = await apiClient.patch(`/auth/updateUser/${id}`, user);
  return res.data;
};
const deleteUserStatus = async (id: string) => {
  const res = await apiClient.delete(`/auth/deleteUser/${id}`);
  return res.data;
};
const getCompanies = async ({
  agentId,
  queryParams,
}: {
  agentId: string;
  queryParams: string;
}) => {
  try {
    const res = await apiClient.get(`/company/companies?${queryParams}`);
    return res.data;
  } catch (err: any) {
    console.error(
      "Error fetching companies:",
      err.response?.data || err.message
    );
    throw err;
  }
};
const updateCompany = async (companyId: string, companyData: any) => {
  try {
    const res = await apiClient.put(
      `/company/update/${companyId}`,
      companyData
    );
    return res.data;
  } catch (err: any) {
    throw err;
  }
};
const deleteCompany = async (companyId: string) => {
  try {
    const res = await apiClient.delete(`/company/delete/${companyId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
// const getCompanyPDF = async () => {
//   const res = await apiClient.get(`/company/agent/documentation-pdf`);
//   return res;
// }
const downloadCompanyPDF = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`${baseUrl}company/companies/doc/pdf`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 👇 Convert blob into a downloadable file
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Company_Documentation.pdf"; // 👈 custom filename
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF download failed:", err);
  }
};

const getProducts = async () => {
  const res = await apiClient.get("/products");
  return res.data;
};

//godowns
const getGodowns = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: any }
) => {
  const res = await apiClient.get(`/godowns/${companyId}?${queryParams}`);
  return res?.data;
};
const addGodowns = async (godown: any) => {
  const res = await apiClient.post("/godowns", godown);
  return res?.data;
};
const updateGodown = async ({ id, godown }: { id: string; godown: any }) => {
  const res = await apiClient.put(`/godowns/${id}`, godown);
  return res?.data;
};
const deleteGodown = async (id: string) => {
  const res = await apiClient.delete(`/godowns/${id}`);
  return res?.data;
};

//stockgroup apis

const getStockGroup = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(`/stock-groups/${companyId}?${queryParams}`);
  return res?.data;
};
const createSockGroup = async (data: any) => {
  const res = await apiClient.post("/stock-groups", data);
  return res?.data;
};
const updateStockGroup = async ({
  stockGroupId,
  stockGroupData,
}: {
  stockGroupId: string;
  stockGroupData: any;
}) => {
  const res = await apiClient.put(
    `/stock-groups/${stockGroupId}`,
    stockGroupData
  );
  return res?.data;
};
const deleteStockGroup = async (stockGroupId: string) => {
  const res = await apiClient.delete(`/stock-groups/${stockGroupId}`);
  return res?.data;
};

//getStockCategory routes

const getStockCategory = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: any }
) => {
  const res = await apiClient.get(
    `/stock-categories/${companyId}?${queryParams}`
  );
  return res?.data;
};

const createStockCategory = async (data: any) => {
  const res = await apiClient.post("/stock-categories", data);
  return res?.data;
};

const updateStockCategory = async ({
  stockCategoryId,
  data,
}: {
  stockCategoryId: string;
  data: any;
}) => {
  const res = await apiClient.put(`/stock-categories/${stockCategoryId}`, data);
  return res?.data;
};

const deleteStockCategory = async (stockCategoryId: string) => {
  const res = await apiClient.delete(`/stock-categories/${stockCategoryId}`);
  return res?.data;
};

//getStockCategory routes

const fetchUOM = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: any }
) => {
  const res = await apiClient.get(`/units/${companyId}?${queryParams}`);
  return res?.data;
};

const createUOM = async (data: any) => {
  const res = await apiClient.post("/units", data);
  return res?.data;
};
const updateUOM = async ({ unitId, data }: { unitId: string; data: any }) => {
  const res = await apiClient.put(`/units/${unitId}`, data);
  return res?.data;
};
const deleteUOM = async (id: string) => {
  const res = await apiClient.delete(`/units/${id}`);
  return res?.data;
};

const fetchProducts = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(`/products/${companyId}?${queryParams}`);
  return res.data;
};

const createProduct = async (product: any) => {
  const res = await apiClient.post("/products", product);
  return res.data;
};

const updateProduct = async ({ id, product }: { id: string; product: any }) => {
  const res = await apiClient.put(`/products/${id}`, product);
  return res.data;
};

const deleteProduct = async (id: number) => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

// Fetch all customers
const fetchCustomers = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(`/customers/${companyId}?${queryParams}`);
  // console.log(res, "fetchCustomers response");
  return res.data;
};

//Create a new customer
const createCustomer = async (customer: any) => {
  const res = await apiClient.post("/customers", customer);
  return res.data;
};

// Update customer by ID
const updateCustomer = async (id: number | string, customer: any) => {
  try {
    const res = await apiClient.put(`/customers/${id}`, customer);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

// Delete customer by ID
const deleteCustomer = async (id: number | string) => {
  const res = await apiClient.delete(`/customers/${id}`);
  return res.data;
};

// Fetch all vendors
const fetchVendors = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(`/vendors/${companyId}?${queryParams}`);
  // console.log(res, "fetchVendors response");
  return res.data;
};

//Create a new vendor
const createVendor = async (vendor: any) => {
  const res = await apiClient.post("/vendors", vendor);
  return res.data;
};

// Update vendor by ID
const updateVendor = async (id: number | string, vendor: any) => {
  try {
    const res = await apiClient.put(`/vendors/${id}`, vendor);
    return res.data;
  } catch (err: any) {
    console.error(
      "Error fetching companies:",
      err.response?.data || err.message
    );
    throw err;
  }
};

// Delete vendor by ID
const deleteVendor = async (id: number | string) => {
  const res = await apiClient.delete(`/vendors/${id}`);
  return res.data;
};

// Fetch all agents
const fetchAgents = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(`/agents/${companyId}?${queryParams}`);
  // console.log(res, "fetchAgents response");
  return res.data;
};

//Create a new agent
const createAgent = async (agent: any) => {
  const res = await apiClient.post("/agents", agent);
  return res.data;
};

// Update agent by ID
const updateAgent = async (id: number | string, agent: any) => {
  try {
    const res = await apiClient.put(`/agents/${id}`, agent);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

// Delete agent by ID
const deleteAgent = async (id: number | string) => {
  const res = await apiClient.delete(`/agents/${id}`);
  return res.data;
};

// Fetch all ledgers
const fetchLedgers = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(`/ledgers/${companyId}?${queryParams}`);
  return res.data;
};

// Create a new ledger
const createLedger = async (ledger: any) => {
  const res = await apiClient.post("/ledgers", ledger);
  return res.data;
};

// Update ledger by ID
const updateLedger = async (id: number | string, ledger: any) => {
  try {
    const res = await apiClient.put(`/ledgers/${id}`, ledger);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

// Delete ledger by ID
const deleteLedger = async (id: number | string) => {
  const res = await apiClient.delete(`/ledgers/${id}`);
  return res.data;
};

const fetchStockItems = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  try {
    const res = await apiClient.get(
      `/stock-items/stockItem/${companyId}?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch stock items:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const fetchOrders = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  try {
    const res = await apiClient.get(
      `/order/orderByCompany/${companyId}?${queryParams}`
    );
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const createOrder = async (orderData: any) => {
  try {
    const res = await apiClient.post("/order/create", orderData);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to create order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const updateOrderStatus = async ({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) => {
  try {
    const res = await apiClient.patch(`/order/${orderId}/status`, { status });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to update order status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const updateOrder = async (orderId: string, orderData: any) => {
  try {
    const res = await apiClient.patch(`/order/${orderId}/shipping`, orderData);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to update order:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const addCart = async (cartData: any, companyId: string) => {
  try {
    const res = await apiClient.post(`/cart/add/${companyId}`, { ...cartData });
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to add cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const fetchCart = async ({ companyId }: { companyId: string }) => {
  try {
    const res = await apiClient.get(`/cart/${companyId}`);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch cart:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const clearCart = async (companyId: string) => {
  return await apiClient.delete(`/cart/clear/${companyId}`);
};

export interface PerformedBy {
  _id: string;
  name?: string;
  email?: string;
}

export interface AuditLog {
  _id: string;
  module: string;
  action: string;
  performedBy?: PerformedBy;
  ipAddress?: string;
  details?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogResponse {
  auditLogs: AuditLog[];
  pagination: Pagination;
}

export interface GetAuditLogsOptions {
  search?: string;
  module?: string;
  action?: string;
  performedBy?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const getAuditLogs = async (params: string) => {
  try {
    const response = await apiClient.get(`/auditLog/client?${params}`);

    const data = response;
    return data;
  } catch (error: any) {
    console.error(
      "❌ Failed to fetch audit logs:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getAuditLogsDetail = async (params: string) => {
  try {
    const response = await apiClient.get(`/auditLog/client/all?${params}`);

    const data = response;
    return data;
  } catch (error: any) {
    console.error(
      "❌ Failed to fetch audit logs:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getAuditLogsByID = async (id: string) => {
  try {
    const response = await apiClient.get(`/auditLog/client/detail/${id}`);

    const data = response;
    return data;
  } catch (error: any) {
    console.error(
      "❌ Failed to fetch audit logs:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const restoreRecord = async ({
  module,
  referenceId,
  id,
}: {
  module: string;
  referenceId: string;
  id: string;
}) => {
  try {
    const response = await apiClient.patch("/auditLog/client/restore", {
      module,
      referenceId,
      id,
    });
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData: any) => {
  try {
    const response = await apiClient.put(
      "/user-management/profile/update",
      profileData
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to update profile:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getStateWiseSales = async (companyId: string) => {
  const res = await apiClient.get(`/order/state-wise/${companyId}`);
  return res.data;
};

const getPartyWiseSales = async (companyId: string) => {
  const res = await apiClient.get(`/order/party-wise/${companyId}`);
  return res.data;
};

const getSalesmanWiseSales = async ({
  companyId,
  period = "month",
}: {
  companyId: string;
  period?: string;
}) => {
  const res = await apiClient.get(
    `/order/salesman-wise-sales/${companyId}?period=${period}`
  );
  return res.data;
};

const getTodaySales = async (companyId: string) => {
  const res = await apiClient.get(`/order/today/${companyId}`);
  return res.data;
};

const getMonthlyComparison = async (companyId: string) => {
  const res = await apiClient.get(`/order/monthly-comparison/${companyId}`);
  return res.data;
};

const getTopCustomers = async (companyId: string) => {
  const res = await apiClient.get(`/order/top-customers/${companyId}`);
  return res.data;
};

const getTopProducts = async (
  companyId: string,
  period: TimePeriod = "month"
) => {
  const params = `?period=${period}`;
  const res = await apiClient.get(`/order/top-products/${companyId}${params}`);
  return res.data;
};

const getDateRangeSales = async (
  companyId: string,
  fromDate: string,
  toDate: string
) => {
  const res = await apiClient.get(
    `/order/date-range/${companyId}?fromDate=${fromDate}&toDate=${toDate}`
  );
  return res.data;
};

const getMyOrders = async (companyId: string) => {
  try {
    const res = await apiClient.get(`/order/my-orders/${companyId}`);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch my orders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const getOrdersByUser = async (companyId: string) => {
  try {
    const res = await apiClient.get(`/order/orders-by-user/${companyId}`);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch orders by user:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const getSalesmanPersonalStats = async ({
  companyId,
  period = "month",
}: {
  companyId: string;
  period?: string;
}) => {
  try {
    const res = await apiClient.get(
      `/order/salesman-personal-stats/${companyId}?period=${period}`
    );
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch personal stats:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getCustomerSalesStats = async ({
  companyId,
  period = "month",
}: {
  companyId: string;
  period?: string;
}) => {
  try {
    const res = await apiClient.get(
      `/order/salesman-personal-stats/${companyId}?period=${period}`
    );
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch personal stats:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getSalesTrend = async (companyId: string) => {
  try {
    const res = await apiClient.get(`/order/sales-trend/${companyId}`);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch sales trend:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const handleLogout = async (id) => {
  try {
    const res = await apiClient.put(`/auth/logout/${id}`);
    if (res.status === 200) {
      console.log("User logged out successfully");
    }
  } catch (error) {
    console.error(
      "❌ Failed to logout:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const sendResetOTP = async (email: string) => {
  try {
    const res = await apiClient.post("/auth/send-otp", { email });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const verifyOTP = async ({ email, otp }: { email: string; otp: string }) => {
  try {
    const res = await apiClient.post("/auth/verify-otp", { email, otp });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const resetPassword = async ({
  email,
  newPassword,
}: {
  email: string;
  newPassword: string;
}) => {
  try {
    const res = await apiClient.post("/auth/reset-password", {
      email,
      newPassword,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Inside api.ts

// api.ts — Fixed & Perfectly

const fetchCustomerGroups = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(
    `/customer-group/all?companyId=${companyId}&${queryParams}`
  );
  return res.data; // → { groups, total, stats: { total, active, inactive }, ... }
};
const createCustomerGroup = async (data: {
  groupName: string;
  status?: "active" | "inactive";
  companyId: string;
}) => {
  const res = await apiClient.post("/customer-group/create", data);
  return res.data;
};

const updateCustomerGroup = async ({
  groupId,
  data,
}: {
  groupId: string;
  data: { groupName?: string; status?: "active" | "inactive" };
}) => {
  const res = await apiClient.put(`/customer-group/update/${groupId}`, data);
  return res.data;
};

const deleteCustomerGroup = async (groupId: string) => {
  const res = await apiClient.delete(`/customer-group/delete/${groupId}`);
  return res.data;
};
const orderReport = async (params: URLSearchParams | string) => {
  try {
    const res = await apiClient.get(`/order/report?${params.toString()}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
const paymentReport = async (params: string) => {
  try {
    const res = await apiClient.get(`/payment/report?${params}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
const customerWiseReport = async (params: string) => {
  try {
    const res = await apiClient.get(`/payment/report/customer-wise?${params}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};
const productWiseReport = async (params: string) => {
  try {
    const res = await apiClient.get(`/order/product-wise?${params}`);
    console.log(res, "res");
    return res.data;
  } catch (error) {
    console.log(error, "productWiseReportError");
    throw error;
  }
};

const fetchTemplates = async ({ queryParams }: { queryParams: string }) => {
  const res = await apiClient.get(`/bill-templates?${queryParams}`);
  return res.data;
};

const getLedgerById = async (id: string) => {
  const res = await apiClient.get(`/ledgers/single/${id}`);
  return res.data;
};

// COUPON

const createCoupon = async (couponData: any) => {
  if (couponData.code === "" || couponData.code == null) {
    delete couponData.code;
  }
  console.log("vikas " + couponData);
  const res = await apiClient.post("/coupons", couponData);
  return res.data;
};
const getAllCouponsByCompany = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(`/coupons/all/${companyId}?${queryParams}`);
  return res.data;
};
const getCouponById = async (id: string) => {
  const res = await apiClient.get(`/coupons/${id}`);
  return res.data;
};
const updateCoupon = async (id: string, couponData: any) => {
  const res = await apiClient.put(`/coupons/${id}`, couponData);
  return res.data;
};
const deleteCoupon = async (id: string) => {
  const res = await apiClient.delete(`/coupons/${id}`);
  return res.data;
};

const createTemplate = async (data: any) => {
  const res = await apiClient.post(`/bill-templates`, data);
  return res.data;
};

const updateTemplate = async (id: string, data: any) => {
  const res = await apiClient.put(`/bill-templates/${id}`, data);
  return res.data;
};

const deleteTemplate = async (id: string) => {
  const res = await apiClient.delete(`/bill-templates/${id}`);
  return res.data;
};

const fetchTemplatesByCompany = async (
  { companyId }: { companyId: string },
  { queryParams }: { queryParams: string }
) => {
  const res = await apiClient.get(
    `/bill-templates/company/${companyId}?${queryParams}`
  );
  return res.data;
};
const PosBillToServer = async (payload: any) => {
  try {
    const res = await apiClient.post("/pos", payload);

    return res;
  } catch (err) {
    console.error("SALE API ERROR:", err);
    return { success: false };
  }
};

export const getCompanyPosReport = async (params) => {
  try {
    const query = new URLSearchParams(params).toString();
    console.log(query);
    const res = await apiClient.get(`/pos?${query}`);
    return res.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

const getBogoCoupons = (companyId) => {
  return apiClient.get(`/coupons/bogo/${companyId}`);
};

const closeShiftApi = (payload: any) => {
  console.log(payload, "this is payload");
  return apiClient.post("shift/close", payload);
};
const getMe = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data;
};
const uploadCsvCustomers = async (payload: any) => {
  const res = await apiClient.post("/customers/upload-csv", payload);
  return res.data;
};
const importProductsFromCSV = async (formData: FormData) => {
  try {
    const res = await apiClient.post("/products/import-csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error: any) {
    console.error(
      "❌ Failed to import products:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const fetchItemsByStockGroup = async ( 
  groupId: string, 
  companyId: string, 
  page: number 
) => { 
  const res = await apiClient.get( 
    `products/stock-group/${companyId}/${groupId}?page=${page}&limit=40` 
  ); 
 
  return res.data;  
}; 
 
export const fetchPriceLevels = (companyId: string) => { 
  return apiClient.get("/price-level", { 
    params: { companyId }, 
  }); 
}; 
 
export const createPriceLevel = (data: { 
  name: string; 
  companyId: string; 
}) => { 
  return apiClient.post("/price-level", data); 
};

const fetchBatches = async (productId, companyId) => {
  const res = await apiClient.get(`/products/batches/stock-item/${productId}`, {
    params: {
      companyId
    }
  });
  return res.data;
}

const updateCartItem = async (companyId: string, payload: { productId: string; quantity: number }) => {
    try {
      const response = await apiClient.put(`/cart/update/${companyId}`, payload);
      return response.data;
    } catch (error: any) {
      console.error("Failed to update cart item:", error);
      throw error.response?.data || error;
    }
}
export const savePriceListPage = (payload: any) => {
  console.log(payload);
  return apiClient.post("/price-list/items", payload);
};
export const fetchPriceList = (companyId: string) => {
  return apiClient.get("/price-list", {
    params: { companyId },
  });
};
export const importPriceListFromCSV = async (formData: FormData) => {
  try {
    const res = await apiClient.post("/price-list/import-csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error: any) {
    console.error(
      "❌ Failed to import price list:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchPriceListById = (id: string) => {
  return apiClient.get(`/price-list/${id}`);
};
export const updatePriceListPage = (id, payload) =>
  apiClient.put(`/price-list/${id}`, payload);


// Export API
const api = {
  closeShiftApi,
  getBogoCoupons,
  getCompanyPosReport,
  PosBillToServer,
  createCompany,
  getCompanies,
  getProducts,
  updateCompany,
  deleteCompany,
  downloadCompanyPDF,
  createUser,
  fetchUsers,
  updateUser,
  deleteUserStatus,
  getGodowns,
  addGodowns,
  updateGodown,
  deleteGodown,
  createSockGroup,
  getStockGroup,
  updateStockGroup,
  deleteStockGroup,
  getStockCategory,
  createStockCategory,
  updateStockCategory,
  deleteStockCategory,
  fetchUOM,
  createUOM,
  updateUOM,
  deleteUOM,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  fetchAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  fetchLedgers,
  createLedger,
  updateLedger,
  deleteLedger,
  getAuditLogs,
  getAuditLogsDetail,
  getAuditLogsByID,
  restoreRecord,
  updateProfile,
  fetchStockItems,
  fetchOrders,
  createOrder,
  addCart,
  fetchCart,
  updateOrderStatus,
  updateOrder,
  clearCart,
  getStateWiseSales,
  getPartyWiseSales,
  getSalesmanWiseSales,
  getTodaySales,
  getMonthlyComparison,
  getTopCustomers,
  getTopProducts,
  getDateRangeSales,
  getMyOrders,
  getOrdersByUser,
  getSalesmanPersonalStats,
  getCustomerSalesStats,
  getSalesTrend,
  handleLogout,
  sendResetOTP,
  verifyOTP,
  resetPassword,
  createCustomerGroup,
  fetchCustomerGroups,
  updateCustomerGroup,
  deleteCustomerGroup,
  createCoupon,
  getAllCouponsByCompany,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  orderReport,
  paymentReport,
  customerWiseReport,
  productWiseReport,
  fetchTemplates,
  getLedgerById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchTemplatesByCompany,
  getMe,
  uploadCsvCustomers,
  importProductsFromCSV,
  fetchBatches,
  updateCartItem
};

export default api;
