import { useEffect, useState } from "react";
import PosOpeningCash from "./PosOpeningCash";
import PosBilling from "./PosBilling";

const Pos = () => {
  const [showOpeningCash, setShowOpeningCash] = useState<boolean>(false);

  // -----------------------------------------
  // 1️⃣ TAB CLOSE → SESSION RESET
  // -----------------------------------------
  useEffect(() => {
    const clearSessionOnClose = () => {
      localStorage.removeItem("posSessionActive");
      // optional — uncomment if you want:
      // localStorage.removeItem("openingCash");
      // localStorage.removeItem("drawerCash");
    };

    window.addEventListener("beforeunload", clearSessionOnClose);
    return () => window.removeEventListener("beforeunload", clearSessionOnClose);
  }, []);

  // -----------------------------------------
  // 2️⃣ CHECK SESSION → SHOW OPENING CASH MODAL
  // -----------------------------------------
  useEffect(() => {
    const sessionActive = localStorage.getItem("posSessionActive");

    // If no session → Show the opening cash modal
    if (!sessionActive) {
      setShowOpeningCash(true);
    }
  }, []);

  // -----------------------------------------
  // 3️⃣ START POS → SET OPENING CASH + SESSION
  // -----------------------------------------
  const handleStartPOS = (amount: number) => {
    localStorage.setItem("openingCash", String(amount));
    localStorage.setItem("drawerCash", String(amount));
    localStorage.setItem("posSessionActive", "true");

    setShowOpeningCash(false);
  };

  // -----------------------------------------
  // 4️⃣ RENDER UI
  // -----------------------------------------
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
          onClose={() => {}}
          onSubmit={handleStartPOS}
        />
      )}

      {!showOpeningCash && <PosBilling />}
    </div>
  );
};

export default Pos;
