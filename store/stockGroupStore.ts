import {create} from "zustand";
import {persist} from "zustand/middleware"
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

interface StockGroupStore{
    stockGroups:StockGroup[];
    loading:boolean;
    error:boolean,
    errormessage:null|string,
    fetchStockGroup:()=>Promise<void>;
    addStockGroup:({stockGroupData}:{stockGroupData:StockGroup})=>Promise<void>;
    updateStockGroup:(params:{stockGroupId:string,stockGrroupData:StockGroup})=>Promise<void>;
    deleteStockGroup:(stockGroupId:string)=>Promise<void>;

    
}

// zustand store with ersistence

export const useStockGroup=create<StockGroupStore>()(
    persist(
        (set,get)=>({
             stockGroups:[],
    loading:false,
    error:false,
    errormessage:null,
    fetchStockGroup:async()=>{
        console.log("fetching")
       
        set({loading:true})
        try {
             const result=await api.getStockGroup()
             console.log(result,"fetch result of stockgrpup[")
             if(result?.statusCode==200){
                set({loading:false,stockGroups:result.data})
             }



            // set()
        } catch (error) {
            set({loading:false,error:true,    errormessage:error.message,
})
        }
    },
    addStockGroup:async(stockGroupData)=>{
set({loading:true})
try {
    const result=await api.createSockGroup(stockGroupData)
    console.log(result ,"update stockgroup")
    
} catch (error) {
      set({loading:false,error:true,    errormessage:error.message})
}

    },
    updateStockGroup:async(stockGroupId,stockGrroupData)=>{
        console.log("updatingggg",stockGroupId,stockGrroupData)

set({loading:true})
try {
   
    const result=await api.updateStockGroup({stockGroupId,stockGrroupData}
    )
    const updateStock=result?.data;
    set({
        stockGroups:get().stockGroups.map((stock)=>stock._id===stockGroupId?updateStock:stock),
        loading: false,
            error: false,
    })

    console.log(result ,"update stockgroup")
    
} catch (error) {
      set({loading:false,error:true,    errormessage:error.message})
}
    },
    deleteStockGroup:async(stockGroupId:string)=>{
        console.log("delete22",stockGroupId)
        try {
             set({ loading: true, error: null });

          const res = await api.deleteStockGroup(stockGroupId);
          console.log("Deleted company response:", res);

          set({
            stockGroups: get().stockGroups.filter((stock) => stock._id !== stockGroupId),
            loading: false,
            error: false,
            
            
          });
            
        } catch (error) {
              set({
            loading: false,
            error:false,
            errormessage: error.response?.data?.message || "Failed to delete stock",
          });
        }

    }

        }),

    )
)