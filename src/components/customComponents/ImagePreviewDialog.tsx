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
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  if (!viewingImage) return null;

  const { type = "Image", previewUrl } = viewingImage;

  const title =
    type === "logo"
      ? "Logo"
      : type.toLowerCase().includes("document")
      ? type
      : `${type} Preview`;

  // --- Controls ---

  const handleZoomIn = useCallback(() => setZoom((z) => z + 0.2), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(0.4, z - 0.2)), []);
  const handleReset = useCallback(() => {
    setZoom(1);
    setRotate(0);
  }, []);
  const handleRotate = useCallback(() => setRotate((r) => r + 90), []);

  // Download Logic
  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `${type}.jpg`;
    link.click();
  }, [previewUrl, type]);

  // Close dialog + reset state
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [onClose, handleReset]);

  return (
    <Dialog open={Boolean(viewingImage)} onOpenChange={handleClose}>
      <DialogContent className="bg-transparent max-w-[95vw] p-4">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-white">{title}</DialogTitle>

          {/* CLOSE BUTTON */}
          <button onClick={handleClose} className="text-white hover:opacity-70">
            <X size={22} />
          </button>
        </DialogHeader>

        {/* Image Container */}
        <div className="flex justify-center items-center mt-4">
          <img
            src={previewUrl}
            alt={type}
            style={{
              transform: `scale(${zoom}) rotate(${rotate}deg)`,
              transition: "transform 0.2s ease",
            }}
            className="max-w-full max-h-[75vh] object-contain rounded-md"
          />
        </div>

        {/* CONTROLS */}
        <div className="flex justify-center gap-4 mt-4 pb-2 flex-wrap">

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"
          >
            <ZoomOut size={22} />
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"
          >
            <ZoomIn size={22} />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"
          >
            <RotateCcw size={22} />
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white/20 rounded-md hover:bg-white/30 text-white"
          >
            Reset
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"
          >
            <Download size={22} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(ImagePreviewDialogComponent);
