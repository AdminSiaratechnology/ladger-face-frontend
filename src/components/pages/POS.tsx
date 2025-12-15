import { useEffect, useRef, useState } from "react";
import PosOpeningCash from "./PosOpeningCash";
import PosBilling from "./PosBilling";
import { usePosStore } from "../../../store/posStore";
import { useCompanyStore } from "../../../store/companyStore";

const Pos = () => {
  const [showOpeningCash, setShowOpeningCash] = useState<boolean>(false);

  // ------------------------------
  // STORES
  // ------------------------------
  const {
    setOpeningCash,
    setDrawerCash,
    setSessionStart,
    clearCart,
  } = usePosStore();

  const { defaultSelected } = useCompanyStore();

  // ------------------------------
  // TAB ID (ONE TIME)
  // ------------------------------
  const tabIdRef = useRef<string>("");

  if (!tabIdRef.current) {
    tabIdRef.current =
      sessionStorage.getItem("posTabId") || String(Date.now());
    sessionStorage.setItem("posTabId", tabIdRef.current);
  }

  const tabId = tabIdRef.current;

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
  // OPENING CASH MODAL VISIBILITY
  // ------------------------------
  useEffect(() => {
    const sessionActive = localStorage.getItem("posSessionActive");
    const savedTab = localStorage.getItem("sessionActive");

    if (!sessionActive) {
      setShowOpeningCash(true);
    } else if (savedTab !== tabId) {
      setShowOpeningCash(false);
    }
  }, [tabId]);

  // ------------------------------
  // COMPANY CHANGE RESET (SKIP FIRST RENDER)
  // ------------------------------
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    localStorage.removeItem("posSessionActive");
    localStorage.removeItem("openingCash");
    localStorage.removeItem("drawerCash");
    localStorage.removeItem("sessionStart");
    localStorage.removeItem("activePosTab");

    clearCart();
    setShowOpeningCash(true);
  }, [defaultSelected, clearCart]);

  // ------------------------------
  // EXTERNAL SESSION END LISTENER
  // ------------------------------
  useEffect(() => {
    const handleSessionEnd = () => setShowOpeningCash(true);

    window.addEventListener("pos-session-ended", handleSessionEnd);
    return () =>
      window.removeEventListener("pos-session-ended", handleSessionEnd);
  }, []);

  // ------------------------------
  // START POS
  // ------------------------------
  const handleStartPOS = (amount: number) => {
    // Zustand
    setOpeningCash(amount);
    setDrawerCash(amount);
    setSessionStart();

    // localStorage
    localStorage.setItem("openingCash", String(amount));
    localStorage.setItem("drawerCash", String(amount));
    localStorage.setItem("sessionStart", new Date().toISOString());
    localStorage.setItem("posSessionActive", "true");
    localStorage.setItem("activePosTab", tabId);

    setShowOpeningCash(false);
  };

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#F5F7FA",
      }}
    >
      {showOpeningCash && (
        <PosOpeningCash
          isOpen={showOpeningCash}
          onSubmit={handleStartPOS}
        />
      )}

      {!showOpeningCash && <PosBilling />}
    </div>
  );
};

export default Pos;
