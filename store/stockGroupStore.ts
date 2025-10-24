// Updated useStockGroup store with pagination support
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware"
import api from "../src/api/api"

export interface StockGroup{
     "_id": string,
            "clientId"?: string,
            "companyId"?: string,
            "name": string,
            "description": string,
            "status": string,
            "stockGroupId"?:string,
            "createdAt"?:string,
            "updatedAt"?: string,
            "__v"?: number
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StockGroupStore{
    stockGroups:StockGroup[];
    pagination: Pagination;
    loading:boolean;
    error:boolean,
    errormessage:null|string,
    fetchStockGroup:(page?: number, limit?: number, companyId?:number | string)=>Promise<void>;
    addStockGroup:(stockGroupData:StockGroup)=>Promise<void>;
    updateStockGroup:(stockGroupId:string,stockGrroupData:StockGroup)=>Promise<void>;
    deleteStockGroup:(stockGroupId:string)=>Promise<void>;
    filterStockGroups: (
    searchTerm: string,
    statusFilter: 'all' | 'active' | 'inactive',
    sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
    companyId?:number | string,
    page?: number,
    limit?: number
  ) => Promise<StockGroup[]>;
}

// zustand store with persistence

export const useStockGroup=create<StockGroupStore>()(
    persist(
        (set,get)=>({
             stockGroups:[],
             pagination: {
               total: 0,
               page: 1,
               limit: 10,
               totalPages: 0
             },
    loading:false,
    error:false,
    errormessage:null,
    fetchStockGroup:async(page = 1, limit = 10)=>{
        console.log("fetching stock groups page:", page, "limit:", limit)
        set({loading:true})
        try {
             const queryParams = new URLSearchParams({
               page: page.toString(),
               limit: limit.toString(),
             });
             console.log(queryParams,"quearpaaaa")
             const id = companyId?.toLocaleString();
             const result=await api.getStockGroup({companyId:id},{ queryParams: queryParams.toString() }); // Adjust if needed
             console.log(result,"fetch result of stockgroup")
             if(result?.statusCode==200){
                set({loading:false,stockGroups:result.data.stockGroups, pagination: result.data.pagination})
             }
        } catch (error) {
            set({loading:false,error:true,    errormessage:error.message,
})
        }
    },
    addStockGroup:async(stockGroupData)=>{
set({loading:true})
try {
    const result=await api.createSockGroup(stockGroupData)
    console.log(result ,"add stockgroup")
    const newStockGroup: StockGroup = result.data;

    set({
      stockGroups: [...get().stockGroups, newStockGroup],
      loading: false,
      error: false,
    });
    
} catch (error) {
      set({loading:false,error:true,    errormessage:error.message})
}

    },
    updateStockGroup:async(stockGroupId,stockGroupData)=>{
        console.log("updatingggg",stockGroupId,stockGroupData)

set({loading:true})
try {
   
    const res=await api.updateStockGroup({stockGroupId:stockGroupId,stockGroupData:stockGroupData})
    const updatedStockGroup: StockGroup = res.data;

    set({
      stockGroups: get().stockGroups.map((stock)=>stock._id===stockGroupId?updatedStockGroup:stock),
      loading: false,
      error: false,
    })

    console.log(res ,"update stockgroup")
    
} catch (error) {
      set({loading:false,error:true,    errormessage:error.message})
}
    },
    deleteStockGroup:async(stockGroupId:string)=>{
        console.log("delete22",stockGroupId)
        try {
             set({ loading: true, error: null });

          const res = await api.deleteStockGroup(stockGroupId);
          console.log("Deleted stockGroup response:", res);

          set({
            stockGroups: get().stockGroups.filter((stock) => stock._id !== stockGroupId),
            loading: false,
            error: false,
            
            
          });
            
        } catch (error) {
              set({loading: false, error:true, errormessage: error.response?.data?.message || "Failed to delete stockGroup"});
        }

    },
    filterStockGroups: async (
        searchTerm: string,
        statusFilter: 'all' | 'active' | 'inactive',
        sortBy: 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc',
        page = 1,
        limit = 10,
        companyId
      ) => {
        try {
          set({ loading: true, error: null });

          const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : '',
            sortBy: sortBy.includes('name') ? 'name' : 'createdAt',
            sortOrder: sortBy.includes('Desc') ? 'desc' : 'asc',
            page: page.toString(),
            limit: limit.toString(),
          });

          const res = await api.getStockGroup({companyId}, { queryParams: queryParams.toString() }); // Adjust api call
          console.log("Database search response for stockGroups:", res);

          set({
            stockGroups: res.data.stockGroups,
            pagination: res?.data?.pagination,
            loading: false,
            error: null,
          });

          return res.data.stockGroups;
        } catch (error: any) {
          set({
            loading: false,
            error:true,
            errormessage: error.response?.data?.message || "Failed to search stockGroups",
          });
          return [];
        }
      },

        }),
        {
          name: "stockgroup-storage",
          // getStorage: () => localStorage,
           storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            stockGroups: state.stockGroups,
          }),
        }
    )
)