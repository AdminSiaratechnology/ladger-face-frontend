import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ViewingImage {
  type: string;
  previewUrl: string;
}

interface ImagePreviewDialogProps {
  viewingImage: ViewingImage | null;
  onClose: () => void;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({ viewingImage, onClose }) => {
  if (!viewingImage) return null;

  const title =
    viewingImage.type === "logo"
      ? "Logo"
      : viewingImage.type
      ? `${viewingImage.type} Document`
      : "Image Preview";

  return (
    <Dialog open={!!viewingImage} onOpenChange={onClose}>
      <DialogContent className="w-fit min-w-[90vw] bg-transparent">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center">
          <img
            src={viewingImage.previewUrl}
            alt={viewingImage.type}
            className="max-w-full max-h-96 object-contain rounded-lg "
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
