import { useEffect, useState } from "react";
import PosOpeningCash from "./PosOpeningCash";
import PosBilling from "./PosBilling";

const Pos = () => {
  const [showOpeningCash, setShowOpeningCash] = useState<boolean>(false);

  useEffect(() => {
    const sessionActive = localStorage.getItem("posSessionActive");

    // show modal only if no active session
    if (!sessionActive) {
      setShowOpeningCash(true);
    }
  }, []);

 const handleStartPOS = (amount: number) => {
  localStorage.setItem("openingCash", String(amount));
  localStorage.setItem("drawerCash", String(amount)); // ⭐ FIX ⭐
  localStorage.setItem("posSessionActive", "true");
  setShowOpeningCash(false);
};


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
