import { useEffect, useState } from "react";
import PosOpeningCash from "./PosOpeningCash";
import PosBilling from "./PosBilling";
import { usePosStore } from "../../../store/posStore";  // ⭐ ADD THIS
import { useCompanyStore } from "../../../store/companyStore";

const Pos = () => {
  const [showOpeningCash, setShowOpeningCash] = useState<boolean>(false);

  // ⭐ Zustand store functions
  const { setOpeningCash, setDrawerCash, setSessionStart } = usePosStore();

  if (!sessionStorage.getItem("posTabId")) {
    sessionStorage.setItem("posTabId", String(Date.now()));
  }
  const tabId = sessionStorage.getItem("posTabId")!;
  const { defaultSelected } = useCompanyStore();
  const { clearCart } = usePosStore();

  // ------------------------------
  // DRAWER RESET LOGIC
  // ------------------------------
  useEffect(() => {
    const sessionActive = localStorage.getItem("posSessionActive");
    const savedTab = localStorage.getItem("activePosTab");

    if (!sessionActive && savedTab !== tabId) {
      localStorage.setItem("drawerCash", "0");
    }
  }, [tabId]);

  // ------------------------------
  // OPENING CASH VISIBILITY LOGIC
  // ------------------------------
  useEffect(() => {
    const sessionActive = localStorage.getItem("posSessionActive");
    const savedTab = localStorage.getItem("activePosTab");

    if (!sessionActive) {
      setShowOpeningCash(true);
    } else if (savedTab !== tabId) {
      setShowOpeningCash(false);
    }
  }, [tabId]);

//   useEffect(() => {
//   if (!defaultSelected) return;

//   // Clear POS session data
//   localStorage.removeItem("posSessionActive");
//   localStorage.removeItem("openingCash");
//   localStorage.removeItem("drawerCash");
//   localStorage.removeItem("sessionStart");
//   localStorage.removeItem("activePosTab");

//   // ⭐ CLEAR CART FROM STORE
//   clearCart();

//   // Show Opening Cash modal again
//   setShowOpeningCash(true);
// }, [defaultSelected]);

  // -----------------------------------------------------
  // ⭐⭐ NEW EFFECT — SHOW OPENING MODAL AFTER SHIFT END
  // -----------------------------------------------------
  useEffect(() => {
    const handleSessionEnd = () => {
      setShowOpeningCash(true);
    };

    window.addEventListener("pos-session-ended", handleSessionEnd);

    return () => {
      window.removeEventListener("pos-session-ended", handleSessionEnd);
    };
  }, []);
  // -----------------------------------------------------


  // ------------------------------
  // START POS (FIXED)
  // ------------------------------
  const handleStartPOS = (amount: number) => {

    // ⭐ UPDATE ZUSTAND STORE
    setOpeningCash(amount);
    setDrawerCash(amount);
    setSessionStart();

    // ⭐ UPDATE localStorage
    localStorage.setItem("openingCash", String(amount));
    localStorage.setItem("drawerCash", String(amount));
    localStorage.setItem("sessionStart", new Date().toISOString());
    localStorage.setItem("posSessionActive", "true");
    localStorage.setItem("activePosTab", tabId);

    setShowOpeningCash(false);
  };

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#F5F7FA" }}>
      
      {/* OPENING CASH MODAL */}
      {showOpeningCash && (
        <PosOpeningCash
          isOpen={showOpeningCash}
          onSubmit={(amount) => handleStartPOS(amount)}
        />
      )}

      {/* POS BILLING */}
      {!showOpeningCash && <PosBilling />}
    </div>
  );
};

export default Pos;
