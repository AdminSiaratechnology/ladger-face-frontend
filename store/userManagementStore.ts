import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../src/api/api";

// Types
interface useUserManagementStore {
  users: any[];
  loading: boolean;
  error: string | null | boolean;
  fetchUsers: () => Promise<void>;
  addUser: (user: any) => Promise<any>;
  editUser:(id:string,user:any)=>Promise<any>;
  deleteUser:(id:string)=>Promise<void>
}

// Zustand store with persist
export const useUserManagementStore = create<useUserManagementStore>()(
  persist(
    (set, get) => ({
      users: [],
      loading: false,
      error: null,


      fetchUsers: async () => {
        set({ loading: true });
        try {
          console.log("Fetching users...");
          const response = await api.fetchUsers();
          set({ users: response.data?.[0]?.users, loading: false });
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
            users: [...state.users, response],
            loading: false,
          }));

          return response;
        } catch (error) {
          console.error("Error creating user:", error);
          set({ loading: false });
        }
      },
      editUser:async(id,user)=>{
        console.log(id,user,"jndnjs")
        
        set({ loading: true });
        try {
        const response=await api.updateUser(id,user);
        const updatedUser=response.data
        set({users:get().users.map((user)=>{
            user._id===id?updatedUser:user
        })})
        

            
        } catch (error) {
             set({ error: error.message, loading: false });
        }

      },
      deleteUser:async(id)=>{

      }

      
    }),
    {
      name: "user-management-storage", // unique key in localStorage
    }
  )
);
