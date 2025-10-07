import { useEffect, useContext } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";
import { toast } from "sonner";

function confirmWithToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast(message, {
      action: {
        label: "Leave",
        onClick: () => resolve(true),
      },
      cancel: {
        label: "Stay",
        onClick: () => resolve(false),
      },
    });
  });
}

function useUnsavedChangesWarning(isFormDirty: boolean) {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  useEffect(() => {
    if (!isFormDirty) return;

    const push = navigator.push;

    navigator.push = async (...args: any[]) => {
      const [to] = args;

      const shouldLeave = await confirmWithToast("You have unsaved changes. Do you really want to leave?");
      if (shouldLeave) {
        push.apply(navigator, args);
      } 
    //   else {
    //     toast.error("Stay on this page. Your changes are not saved yet!");
    //   }
    };

    return () => {
      navigator.push = push;
    };
  }, [isFormDirty, navigator]);

  // Browser tab close / reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = "";
        toast.error("You have unsaved changes!");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFormDirty]);
}

export default useUnsavedChangesWarning;
