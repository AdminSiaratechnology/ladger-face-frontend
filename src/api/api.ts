import axios from "axios";
import baseUrl from "../lib/constant";
console.log("Base URL:", baseUrl);

// Create axios instance
const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    // "Content-Type": "application/json",
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



//Create user Api 

const createUser = async (userData: any) => {
  console.log("Creating user with data:", userData);
  const res = await apiClient.post("/auth/register", userData);
  return res.data;
};

//Fetch users for agent 

const fetchUsers=async({queryParams}:{queryParams:string})=>{
  console.log("fewtching usersss ");
  const res=await apiClient.get(`/user-management/client/allUsers?${queryParams}`)
  console.log(res,"fetched users response")
  return res.data
}

// API functions
const createCompany = async (companyData: any) => {
  console.log("Creating company with data:", companyData);
  // return companyData;
  const res = await apiClient.post("/company/create", companyData);
  return res.data;
};
const updateUser=async(id,user)=>{
  const res=await apiClient.patch(`/auth/updateUser/${id}`,user)
  return res.data

}
const deleteUserStatus=async(id:string)=>{
const res=await apiClient.delete(`/auth/deleteUser/${id}`)
return res.data
}
const getCompanies = async ({agentId,queryParams}:{agentId:string,queryParams:string}) => {
  console.log(queryParams,"queryParams")
  try {
    console.log("Fetching companies...");
    const res = await apiClient.get(`/company/agent/companies?${queryParams}`);
    console.log("Fetched companies:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error fetching companies:", err.response?.data || err.message);
    throw err;
  }
};
const updateCompany = async (companyId: string, companyData: any) => {
 
  try {
    
  
  const res=await apiClient.put(`/company/update/${companyId}`,companyData)
  return res.data
  } catch (err: any) {
    console.error("Error fetching companies:", err.response?.data || err.message);
    throw err;
  }
}
const deleteCompany = async (companyId: string) => {
  const res = await apiClient.delete(`/company/delete/${companyId}`);
  return res.data;
}

const getProducts = async () => {
  const res = await apiClient.get("/products");
  return res.data;
};


//godowns 
const getGodowns=async({queryParams}:{queryParams:any})=>{
  console.log(queryParams,"quearyparmsgodiwn")

  const res=await apiClient.get(`/godowns?${queryParams}`)
  return res?.data
}
const addGodowns=async(godown:any)=>{
  const res=await apiClient.post("/godowns",godown)
  return res?.data
}
const updateGodown=async({id, godown}:{id:string,godown:any})=>{
  const res=await apiClient.put(`/godowns/${id}`,godown)
  return res?.data
}
const deleteGodown=async(id:string)=>{
  const res=await apiClient.delete(`/godowns/${id}`)
  return res?.data
}

//stockgroup apis

const getStockGroup=async({queryParams}:{queryParams:string})=>{
  const res=await apiClient.get(`/stock-groups?${queryParams}`);
  return res?.data
}
const createSockGroup=async(data:any)=>{
  const res=await apiClient.post("/stock-groups",data);
  return res?.data
}
const updateStockGroup=async({stockGroupId,stockGrroupData}:{stockGroupId:string,stockGrroupData:any})=>{
  console.log("hihih",stockGroupId,stockGrroupData)
  const res=await apiClient.put(`/stock-groups/${stockGroupId}`,stockGrroupData)
  return res?.data
}
const deleteStockGroup=async(stockGroupId:string)=>{
  console.log("hihih",stockGroupId)
  const res=await apiClient.delete(`/stock-groups/${stockGroupId}`)
  return res?.data
}

//getStockCategory routes

const getStockCategory = async () => {
  const res = await apiClient.get("/stock-categories");
  return res?.data;
};

const createStockCategory = async (data: any) => {
  const res = await apiClient.post("/stock-categories", data);
  return res?.data;
};

const updateStockCategory = async ({ stockCategoryId, data }: { stockCategoryId: string; data: any }) => {
  const res = await apiClient.put(`/stock-categories/${stockCategoryId}`, data);
  return res?.data;
};

const deleteStockCategory = async (stockCategoryId: string) => {
  const res = await apiClient.delete(`/stock-categories/${stockCategoryId}`);
  return res?.data;
};

//getStockCategory routes

const fetchUOM = async ({queryParams}:{queryParams:any}) => {
  const res = await apiClient.get(`/units?${queryParams}`);
  return res?.data;
};

const createUOM = async (data: any) => {
  const res = await apiClient.post("/units", data);
  return res?.data;
};
const updateUOM = async ({ unitId,data }: { unitId: string; data: any }) => {
  
  const res = await apiClient.put(`/units/${unitId}`, data);
  return res?.data;
};
const deleteUOM = async (id: string) => {
  const res = await apiClient.delete(`/units/${id}`);
  return res?.data;
};

const fetchProducts = async ({queryParams}:{queryParams:string}) => {
  const res = await apiClient.get(`/products?${queryParams}`);
  console.log(res,"ressfetchproduct")
  return res.data;
};

const createProduct = async (product) => {
  console.log(product,"createProductcreateProduct")
  const res = await apiClient.post("/products", product);
  return res.data;
};

const updateProduct = async (id, product) => {
  const res = await apiClient.put(`/products/${id}`, product);
  return res.data;
};

const deleteProduct = async (id: number) => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

// Fetch all customers
const fetchCustomers = async ({queryParams}:{queryParams:string}) => {
  const res = await apiClient.get(`/agent/customers?${queryParams}}`);
  // console.log(res, "fetchCustomers response");
  return res.data;
};

//Create a new customer
const createCustomer = async (customer: any) => {
  console.log(customer, "createCustomer payload");
  const res = await apiClient.post("/agent/customers", customer);
  return res.data;
};

// Update customer by ID
const updateCustomer = async (id: number | string, customer: any) => {
  try{
  console.log(id, customer, "updateCustomer payload");
  const res = await apiClient.put(`/agent/customers/${id}`, customer);
  console.log(res.data,"ressss")
  return res.data;
  } catch (err: any) {
    console.error("Error fetching companies:", err.response?.data || err.message);
    throw err;
  }
};

// Delete customer by ID
const deleteCustomer = async (id: number | string) => {
  const res = await apiClient.delete(`/agent/customers/${id}`);
  return res.data;
};

// Fetch all vendors
const fetchVendors = async ({queryParams}:{queryParams:string}) => {
  const res = await apiClient.get(`/agent/vendors?${queryParams}`);
  // console.log(res, "fetchVendors response");
  return res.data;
};

//Create a new vendor
const createVendor = async (vendor: any) => {
  console.log(vendor, "createVendor payload");
  const res = await apiClient.post("/agent/vendors", vendor);
  return res.data;
};

// Update vendor by ID
const updateVendor = async (id: number | string, vendor: any) => {
  try{
  console.log(id, vendor, "updateVendor payload");
  const res = await apiClient.put(`/agent/vendors/${id}`, vendor);
  console.log(res.data,"ressss")
  return res.data;
  } catch (err: any) {
    console.error("Error fetching companies:", err.response?.data || err.message);
    throw err;
  }
};

// Delete vendor by ID
const deleteVendor = async (id: number | string) => {
  const res = await apiClient.delete(`/agent/vendors/${id}`);
  return res.data;
};

// Fetch all agents
const fetchAgents = async ({queryParams}:{queryParams:string}) => {
  const res = await apiClient.get(`/agent/agents?${queryParams}`);
  // console.log(res, "fetchAgents response");
  return res.data;
};

//Create a new agent
const createAgent = async (agent: any) => {
  console.log(agent, "createAgent payload");
  const res = await apiClient.post("/agent/agents", agent);
  return res.data;
};

// Update agent by ID
const updateAgent = async (id: number | string, agent: any) => {
  try{
  console.log(id, agent, "updateAgent payload");
  const res = await apiClient.put(`/agent/agents/${id}`, agent);
  console.log(res.data,"ressss")
  return res.data;
  } catch (err: any) {
    console.error("Error fetching companies:", err.response?.data || err.message);
    throw err;
  }
};

// Delete agent by ID
const deleteAgent = async (id: number | string) => {
  const res = await apiClient.delete(`/agent/agents/${id}`);
  return res.data;
};

// Fetch all ledgers
const fetchLedgers = async ({queryParams}:{queryParams:string}) => {
  const res = await apiClient.get(`/agent/ledgers?${queryParams}`);
  return res.data;
};

// Create a new ledger
const createLedger = async (ledger: any) => {
  console.log(ledger, "createLedger payload");
  const res = await apiClient.post("/agent/ledgers", ledger);
  return res.data;
};

// Update ledger by ID
const updateLedger = async (id: number | string, ledger: any) => {
  try {
    console.log(id, ledger, "updateLedger payload");
    const res = await apiClient.put(`/agent/ledgers/${id}`, ledger);
    console.log(res.data, "ressss");
    return res.data;
  } catch (err: any) {
    console.error("Error updating ledger:", err.response?.data || err.message);
    throw err;
  }
};

// Delete ledger by ID
const deleteLedger = async (id: number | string) => {
  const res = await apiClient.delete(`/agent/ledgers/${id}`);
  return res.data;
};








// Export API
const api = {
  createCompany,
  getCompanies,
  getProducts,
  updateCompany,
  deleteCompany,
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
  fetchVendors,createVendor,
  updateVendor,
  deleteVendor,
  fetchAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  fetchLedgers, createLedger, updateLedger, deleteLedger 


}

export default api;
