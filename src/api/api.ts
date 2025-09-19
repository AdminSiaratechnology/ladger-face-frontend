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

const fetchUsers=async()=>{
  console.log("fewtching usersss ");
  const res=await apiClient.get("/user-management/client/allUsers")
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


//godowns 
const getGodowns=async()=>{
  const res=await apiClient.get("/godowns")
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

const getStockGroup=async()=>{
  const res=await apiClient.get("/stock-groups");
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

const fetchUOM = async () => {
  const res = await apiClient.get("/units");
  return res?.data;
};

const createUOM = async (data: any) => {
  const res = await apiClient.post("/units", data);
  return res?.data;
};
const updateUOM = async ({ id, unit }: { id: string; unit: any }) => {
  console.log(id,unit,"iddd")
  const res = await apiClient.put(`"/units/${id}`, unit);
  return res?.data;
};
const deleteUOM = async (id: string) => {
  const res = await apiClient.delete(`/units/${id}`);
  return res?.data;
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
  deleteUOM

}

export default api;
