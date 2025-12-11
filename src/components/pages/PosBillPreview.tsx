import React from "react";
import html2pdf from "html2pdf.js";

export default function PosBillPreview({ data, onClose, onDownload }: any) {
  if (!data) return null;

  const downloadPDF = () => {
    const element = document.getElementById("invoice-preview-box");

    const opt = {
      filename: `invoice-${data.billNumber}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "a4",   // ⭐ PAPER SIZE: "a4" or [80,200] for thermal
        orientation: "portrait",
      },
    };

    html2pdf().from(element).set(opt).save().then(() => {
      onDownload(); // POS reset after download
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[500px] p-6 max-h-[90vh] overflow-y-auto">

        <h1 className="text-xl font-bold text-center mb-4">Invoice Preview</h1>

        {/* ⭐ EXACT SAME UI FOR PREVIEW + PDF ⭐ */}
        <div id="invoice-preview-box" className="bg-white p-4 border rounded-lg">

          <h2 className="text-lg font-bold text-center">
            {data.company}
          </h2>

          <p className="text-sm text-center">
            {new Date(data.date).toLocaleString()}
          </p>

          <hr className="my-2" />

          <p><strong>Bill No:</strong> {data.billNumber}</p>
          <p><strong>Name:</strong> {data.customerName}</p>
          <p><strong>Phone:</strong> {data.customerPhone}</p>

          <hr className="my-2" />

          <h3 className="font-semibold mb-2">Items</h3>
          {data.items.map((i: any, index: number) => (
            <div key={index} className="flex justify-between text-sm border-b py-1">
              <span>{i.name} × {i.qty}</span>
              <span>₹{(i.qty * i.price).toFixed(2)}</span>
            </div>
          ))}

          <div className="text-right mt-3 space-y-1 text-sm">
            <p><strong>Subtotal:</strong> ₹{data.subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> ₹{data.taxAmount.toFixed(2)}</p>
            <p className="text-lg font-bold">Total: ₹{data.grandTotal.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={downloadPDF}
          className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl"
        >
          Download Invoice
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-300 py-2 rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
}
