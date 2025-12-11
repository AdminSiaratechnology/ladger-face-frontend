// src/components/pages/ShiftEndModal.tsx
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
// import HeaderGradient from "../../customComponents/HeaderGradint";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import HeaderGradient from "../customComponents/HeaderGradint";

export default function ShiftEndModal({
  openingCash,
  todayCashSales,
  onClose,
}: {
  openingCash: number;
  todayCashSales: number;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const notes = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

  const [qty, setQty] = useState(
    notes.reduce((obj, n) => ({ ...obj, [n]: "" }), {})
  );

  const updateQty = (n: number, val: string) =>
    setQty({ ...qty, [n]: val });

  const counted = notes.reduce(
    (sum, n) => sum + Number(qty[n] || 0) * n,
    0
  );

  const expected = openingCash + todayCashSales;
  const diff = counted - expected;

  const handleCloseShift = () => {
    localStorage.removeItem("openingCash");
    localStorage.removeItem("drawerCash");
    localStorage.removeItem("todayCashSales");
    localStorage.removeItem("cart");
    localStorage.removeItem("posSessionActive")

    onClose();        // close modal
    navigate("/pos"); // go back to Opening Cash screen
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="custom-dialog-container ">
        
        {/* HEADER LIKE COUPON MODAL */}
        <HeaderGradient
          title="Shift End Summary"
          subtitle="Count closing cash & verify expected amount"
        />

        <div className="mt-4 space-y-5 max-h-[70vh] overflow-y-auto pr-2">

          {/* DENOMINATION CARD */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-lg font-semibold">Denomination Count</h3>

              <div className="grid grid-cols-2 gap-3">
                {notes.map((n) => (
                  <div
                    key={n}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border"
                  >
                    <span className="font-medium text-gray-700">
                      ₹{n}
                    </span>

                    <input
                      type="number"
                      className="border rounded-lg w-20 px-2 py-1 text-right focus:ring-2 focus:ring-teal-400"
                      value={qty[n]}
                      placeholder="0"
                      onChange={(e) => updateQty(n, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CASH SUMMARY CARD */}
          <Card>
            <CardContent className="p-4 space-y-2">

              <div className="flex justify-between">
                <span>Opening Cash</span>
                <strong>₹{openingCash}</strong>
              </div>

              <div className="flex justify-between">
                <span>Today Cash Sales</span>
                <strong>₹{todayCashSales}</strong>
              </div>

              <div className="flex justify-between">
                <span>Expected Cash</span>
                <strong className="text-blue-600">₹{expected}</strong>
              </div>

              <div className="flex justify-between">
                <span>Counted Cash</span>
                <strong className="text-green-600">₹{counted}</strong>
              </div>

              <div className="flex justify-between">
                <span>Difference</span>
                <strong
                  className={`${
                    diff === 0
                      ? "text-gray-700"
                      : diff > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{diff}
                </strong>
              </div>

            </CardContent>
          </Card>

          {/* FOOTER BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={handleCloseShift}
            >
              Close Shift
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
