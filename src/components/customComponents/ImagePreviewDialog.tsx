import React, { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, RotateCcw, ZoomIn, ZoomOut, X } from "lucide-react";

interface ViewingImage {
  type?: string;
  previewUrl: string;
}

interface ImagePreviewDialogProps {
  viewingImage: ViewingImage | null;
  onClose: () => void;
}

const ImagePreviewDialogComponent: React.FC<ImagePreviewDialogProps> = ({
  viewingImage,
  onClose,
}) => {
  // 1. Hooks MUST be at the top level (always executed)
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  // Safe extraction for hooks dependencies (use default values if null)
  const previewUrl = viewingImage?.previewUrl || "";
  const type = viewingImage?.type || "Image";

  // 2. Define all callbacks BEFORE any return statement
  const handleZoomIn = useCallback(() => setZoom((z) => z + 0.2), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.4, z - 0.2)), []);
  
  const handleReset = useCallback(() => {
    setZoom(1);
    setRotate(0);
  }, []);

  const handleRotate = useCallback(() => setRotate((r) => r + 90), []);

  const handleDownload = useCallback(() => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `${type}.jpg`;
    link.click();
  }, [previewUrl, type]);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [onClose, handleReset]);

  // 3. NOW you can return null if there is no data
  if (!viewingImage) return null;

  const title =
    type === "logo"
      ? "Logo"
      : type.toLowerCase().includes("document")
      ? type
      : `${type} Preview`;

  return (
    <Dialog open={Boolean(viewingImage)} onOpenChange={handleClose}>
      <DialogContent className="bg-transparent border-none shadow-none max-w-[95vw] p-4 text-white">
        {/* Transparent header container to align items */}
        <DialogHeader className="flex flex-row justify-between items-center w-full mb-4">
          <DialogTitle className="text-white text-xl font-semibold">{title}</DialogTitle>
          
          <button 
            onClick={handleClose} 
            className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors text-white"
          >
            <X size={24} />
          </button>
        </DialogHeader>

        {/* Image Container with scroll/overflow handling */}
        <div className="flex justify-center items-center w-full h-[70vh] overflow-hidden">
          <img
            src={previewUrl}
            alt={type}
            style={{
              transform: `scale(${zoom}) rotate(${rotate}deg)`,
              transition: "transform 0.2s ease",
            }}
            className="max-w-full min-w-[150px] max-h-full object-contain rounded-md shadow-2xl"
          />
        </div>

        {/* CONTROLS */}
        <div className="flex justify-center gap-4 mt-6 pb-2 flex-wrap">
          <button onClick={handleZoomOut} className="p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 text-white transition-all">
            <ZoomOut size={20} />
          </button>

          <button onClick={handleZoomIn} className="p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 text-white transition-all">
            <ZoomIn size={20} />
          </button>

          <button onClick={handleRotate} className="p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 text-white transition-all">
            <RotateCcw size={20} />
          </button>

          <button onClick={handleReset} className="px-6 py-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 text-white font-medium transition-all">
            Reset
          </button>

          <button onClick={handleDownload} className="p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 text-white transition-all">
            <Download size={20} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(ImagePreviewDialogComponent);