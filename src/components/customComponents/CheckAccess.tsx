import { checkPermission } from "../../lib/utils";
import { useAuthStore } from "../../../store/authStore"
interface CheckAccess{
    children: React.ReactNode,module
    ?:string, subModule?:string,type?:string
}


export const CheckAccess = ({children,module, subModule,type}:CheckAccess) => {
    console.log(children,module, subModule,type,"CheckAccessCheckAccess"
      

    )
    // return <>{children}</>;
        const {user,isLoading}=useAuthStore();
        if (module && subModule) {
            const hasPermission = checkPermission({user, module, subModule,type});
            if (!hasPermission) {
              return null
            }
          }

        if(isLoading){
           return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
        }



  return <>{children}</>;
}
