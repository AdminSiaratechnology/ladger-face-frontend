import React from "react";

interface LimitExceedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LimitExceedModal: React.FC<LimitExceedModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Limit Exceeded
        </h2>

        <p className="text-gray-600 mb-6">
          All limits for creating users have been exhausted.
          <br />
          Please contact your administrator.
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitExceedModal;
