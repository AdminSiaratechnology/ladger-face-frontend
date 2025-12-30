import React from "react";
import { X } from "lucide-react";

interface RightSideOverlayProps {
  open: boolean;
  onClose: () => void;
  width?: string; // desktop width e.g. "60vw"
  title?: string;
  children: React.ReactNode;
}

const RightSideOverlay: React.FC<RightSideOverlayProps> = ({
  open,
  onClose,
  width = "60vw",
  title,
  children,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 z-40
          bg-black/40
          transition-opacity duration-300 ease-out cursor-pointer
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Right Panel */}
      <div
        className={`
          fixed top-0 right-0 z-50
          h-screen bg-white
          shadow-2xl border-l

          transform-gpu will-change-transform
          transition-transform duration-300 ease-out

          ${open ? "translate-x-0" : "translate-x-full"}

          w-full sm:max-w-none
        `}
        style={{
          width: "100%",      // mobile default
          maxWidth: width,    // desktop override
        }}
      >
        {/* HEADER */}
        <div className="h-16 px-5 flex items-center justify-between
                        bg-gradient-to-br from-teal-500 to-teal-600">
          <p className="text-white font-semibold truncate">
            {title || "Details"}
          </p>

          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/20 cursor-pointer"
          >
            <X className="text-white w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto bg-white">
          {children}
        </div>
      </div>
    </>
  );
};

export default RightSideOverlay;
