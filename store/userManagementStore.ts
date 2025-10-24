// Updated useUserManagementStore with pagination and filter support
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";

// Types
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface useUserManagementStore {
  users: any[];
  pagination: Pagination;
  loading: boolean;
  error: string | null | boolean;
  fetchUsers: (page?: number, limit?: number,
    companyId?:number | string,

  ) => Promise<void>;
  addUser: (user: any) => Promise<any>;
  editUser:(id:string,user:any)=>Promise<any>;
  deleteUser:(id:string)=>Promise<void>;
  filterUsers: (
    searchTerm: string,
    roleFilter: 'all' | string,
    statusFilter: 'all' | 'active' | 'inactive',
    sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
    companyId?:number | string,
    page?: number,
    limit?: number
  ) => Promise<any[]>;
}

// Zustand store with persist
export const useUserManagementStore = create<useUserManagementStore>()(
  persist(
    (set, get) => ({
      users: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      },
      loading: false,
      error: null,


      fetchUsers: async (page = 1, limit = 10, companyId) => {
        set({ loading: true });
        try {
          console.log("Fetching users...");
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });
          const id = companyId?.toLocaleString();
          const response = await api.fetchUsers({companyId:id}, { queryParams: queryParams.toString() }); // Adjust api call if needed
          set({ users: response.data?.[0]?.users || [], pagination: response.data?.pagination, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addUser: async (user) => {
        try {
          set({ loading: true });
          const response = await api.createUser(user);
          console.log("User created response:", response);

          // Update persisted state with new user
          set((state) => ({
            users: [...state.users, response?.data],
            loading: false,
          }));

          return response;
        } catch (error: any) {
          console.error("Error creating user:", error);
          set({ loading: false });
        }
      },
      editUser:async(id,user)=>{
        // console.log(id,user,"jndnjs")
        
        set({ loading: true });
        try {
        const response=await api.updateUser(id,user);
        console.log(response,"responseof updateuser")
        const updatedUser=response.data
        console.log(updatedUser,"dataof updateuser")
        let allusers=get().users;
        console.log()
        let hii=get().users.map((user)=>{
           return user?.["_id"]===id?updatedUser:user
         
        })
        console.log(hii,"hiii")

        // set({users:get().users.map((user)=>{
        //     user?.["_id"]===id?updatedUser:user
        // })})
        

            
        } catch (error:any) {
             set({ error: error.message, loading: false });
        }

      },
      deleteUser:async(id)=>{
        set({loading:true})
        try {
          const response=await api.deleteUserStatus(id)
          console.log(response,"deleteresomnse")
          
        } catch (error :any) {
          set({loading:false,error:error.message})
        }


      },

      filterUsers: async (
        searchTerm: string,
        roleFilter: 'all' | string,
        statusFilter: 'all' | 'active' | 'inactive',
        sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
        page = 1,
        limit = 10,
        companyId: string
      ) => {
        set({ loading: true });
        try {
          const queryParams = new URLSearchParams({
            search: searchTerm,
            role: roleFilter !== 'all' ? roleFilter : '',
            status: statusFilter !== 'all' ? statusFilter : '',
            sortBy: sortBy.includes('name') ? 'name' : 'createdAt',
            sortOrder: sortBy.includes('Desc') ? 'desc' : 'asc',
            page: page.toString(),
            limit: limit.toString(),
            companyId:companyId?.toLocaleString(),
          });

          const response = await api.fetchUsers({companyId}, { queryParams: queryParams.toString() }); // Adjust api call
          set({ users: response.data?.users || [], pagination: response.data?.pagination, loading: false });
          console.log(response.data.users,".data?.data?.users")
          return response.data?.users || [];
        } catch (error: any) {
          set({ error: error.message, loading: false });
          return [];
        }
      }
      
    }),
    {
      name: "user-management-storage", // unique key in localStorage
    }
  )
);