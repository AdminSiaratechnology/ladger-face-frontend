import { useEffect, useMemo, useState } from "react";
import { useStockItemStore } from "../../../store/stockItemStore";
import { useCompanyStore } from "../../../store/companyStore";
import { usePosStore } from "../../../store/posStore";

import PosCart from "./PosCart";
import PosSummary from "./PosSummary";
import PosBatchModal from "./PosBatchModal";
import DraftBillModal from "./DraftBillModal";
import { generateInvoicePdf } from "../../lib/invoice";

export default function PosBilling() {
  const { stockItems, fetchStockItems } = useStockItemStore();
  const { defaultSelected } = useCompanyStore();
  const [billNumber, setBillNumber] = useState("");

  // ------------------------
  // POS STORE
  // ------------------------
  const {
    cart,
    setCart,
    customerName,
    customerPhone,
    setCustomerName,
    setCustomerPhone,
    drawerCash,
    updateDrawerCash,
    addDraftBill,
    loadDraftBill,
    batchProduct,
    setBatchProduct,
  } = usePosStore();

  // ------------------------
  // LOCAL STATE
  // ------------------------
  const [searchText, setSearchText] = useState("");

  const [payment, setPayment] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewBill, setPreviewBill] = useState(null);

  // ------------------------
  // FETCH STOCK ITEMS
  // ------------------------
  useEffect(() => {
    if (defaultSelected?._id) {
      fetchStockItems?.(1, 1000, defaultSelected._id);
    }

    // OPENING CASH LOAD LOGIC
    let openCash = localStorage.getItem("openingCash");
    let drawer = localStorage.getItem("drawerCash");

    // Agar openingCash hai but drawerCash nahi
    if (!drawer) {
      drawer = openCash || "0";
      localStorage.setItem("drawerCash", drawer);
    }

    // --- MOST IMPORTANT FIX ---
    updateDrawerCash(Number(drawer));

  }, [defaultSelected?._id]);


  const products = Array.isArray(stockItems) ? stockItems : [];

  // ------------------------
  // SEARCH RESULTS
  // ------------------------
  const searchResults = useMemo(() => {
    if (!searchText) return [];
    const s = searchText.toLowerCase();
    return products.filter(
      (p) =>
        p.ItemName.toLowerCase().includes(s) ||
        (p.ItemCode || "").toLowerCase().includes(s)
    );
  }, [searchText, products]);

  // ------------------------
  // ADD PRODUCT TO CART
  // ------------------------
  const addProductToCart = (product, batch) => {
    const id = batch ? `${product._id}-${batch.BatchName}` : product._id;

    setCart((prev) => {
      const exists = prev.find((x) => x.cartId === id);

      if (exists) {
        return prev.map((x) =>
          x.cartId === id ? { ...x, qty: x.qty + 1 } : x
        );
      }

      return [
        ...prev,
        {
          cartId: id,
          _id: product._id,
          ItemName: product.ItemName,
          ItemCode: product.ItemCode,
          price: product.Price,
          qty: 1,
          batch: batch?.BatchName || null,
          availableQty: batch?.Qty || null,
        },
      ];
    });

    setBatchProduct(null);
    setSearchText("");
  };

  const addToCart = (prod) => {
    const validBatches = (prod.GodownDetails || []).filter(
      (b) => b.BatchName && b.BatchName !== "No Batch" && b.Qty > 0
    );

    if (validBatches.length === 0) return addProductToCart(prod, null);

    setBatchProduct({ ...prod, GodownDetails: validBatches });
  };

  // ------------------------
  // CART OPERATIONS
  // ------------------------
  const increaseQty = (id) =>
    setCart(
      cart.map((x) => (x.cartId === id ? { ...x, qty: x.qty + 1 } : x))
    );

  const decreaseQty = (id) =>
    setCart(
      cart
        .map((x) =>
          x.cartId === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x
        )
        .filter((x) => x.qty > 0)
    );

  const removeItem = (id) =>
    setCart(cart.filter((x) => x.cartId !== id));

  const clearCart = () => setCart([]);

  // ------------------------
  // TOTAL CALCULATIONS
  // ------------------------
  const subtotal = Number(
    cart.reduce((s, p) => s + p.qty * p.price, 0).toFixed(2)
  );

  const gstAmount = Number((subtotal * 0.18).toFixed(2));
  const totalAmount = subtotal + gstAmount;

  // ------------------------
  // HOLD BILL
  // ------------------------
  const handleHoldBill = () => {
    addDraftBill({
      id: Date.now(),
      cart,
      customerName,
      customerPhone,
      subtotal,
      gstAmount,
      totalAmount,
      createdAt: new Date().toISOString(),
    });

    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setPayment("");
    setCashReceived("");
    setBillNumber("---");
  };

  // ------------------------
  // LOAD DRAFT BILL
  // ------------------------
  const handleLoadDraft = (draft) => {
    loadDraftBill(draft);
    setPayment("");
    setCashReceived("");
    setShowDraftModal(false);
  };
  const handleCompleteBill = async (paymentData) => {
    if (cart.length === 0) return;

    updateDrawerCash(paymentData.grandTotal);

    const newBillNo = "INV-" + Math.floor(100000 + Math.random() * 900000);
    setBillNumber(newBillNo);

    const payload = {
      billNumber: newBillNo,
      customerName,
      customerPhone,
      createdAt: new Date().toISOString(),

      items: cart.map((c) => ({
        name: c.ItemName,
        qty: c.qty,
        price: c.price,
        total: c.qty * c.price,
        batch: c.batch
      })),

      subtotal,
      taxAmount: paymentData.taxAmount,
      grandTotal: paymentData.grandTotal,

      paymentInfo: paymentData
    };

    setPreviewBill(payload);
    setShowPreview(true);
  };

  // ------------------------
  // DOWNLOAD BILL
  // ------------------------
  const handleDownloadInvoice = async () => {
    if (!previewBill) return;

    await generateInvoicePdf({
      billNumber: previewBill.billNumber,
      createdAt: previewBill.createdAt,

      company: {
        CompanyName: defaultSelected?.namePrint || "",
        Address: `${defaultSelected?.address1 || ""}, ${defaultSelected?.address2 || ""}, ${defaultSelected?.address3 || ""}, ${defaultSelected?.city || ""}, ${defaultSelected?.state || ""} - ${defaultSelected?.pincode || ""}`,
        phone: defaultSelected?.mobile || defaultSelected?.telephone || "",
        country: defaultSelected?.country || "",
        gstNumber: defaultSelected?.gstNumber || "",
        logo: defaultSelected?.logo || ""
      },

      customer: {
        name: previewBill.customerName || "",
        phone: previewBill.customerPhone || ""
      },

      items: previewBill.items || [],

      subtotal: Number(previewBill.subtotal) || 0,
      taxAmount: Number(previewBill.taxAmount) || 0,
      grandTotal: Number(previewBill.grandTotal) || 0,

      paymentInfo: previewBill.paymentInfo || {}
    });

    // RESET POS
    setCart([]);
    setPayment("");
    setCashReceived("");
    setCustomerName("");
    setCustomerPhone("");
    setBillNumber("");
    setPreviewBill(null);
    setShowPreview(false);
  };



  return (
    <div className="w-full h-full bg-gray-100">
      {/* HEADER */}
      <div className="bg-blue-600 text-white p-4 rounded-b-2xl shadow-md flex justify-between">
        <h1 className="text-xl font-semibold">POS Billing</h1>

        <div className="flex items-center gap-5">
          <div className="bg-white/20 px-4 py-1.5 rounded-lg text-sm">
            Drawer: ₹{Number(drawerCash || 0).toFixed(2)}
          </div>

          <button
            onClick={() => localStorage.removeItem("posSessionActive")}
            className="bg-white text-blue-700 px-4 py-1.5 rounded-lg cursor-pointer"
          >
            Shift End
          </button>
        </div>
      </div>

      {/* BILL HEADER */}
      <div className="bg-white mx-4 mt-3 px-4 py-3 shadow-sm border rounded-xl flex justify-between">
        <span className="text-sm">
          <label className="font-bold">Bill No:</label> {billNumber}
        </span>

        <span className="text-sm">
          <label className="font-bold">Date:</label>{" "}
          {new Date().toLocaleString()}
        </span>

        <button
          onClick={() => setShowDraftModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer"
        >
          Draft Bills
        </button>
      </div>

      {/* BODY */}
      <div className="p-5 grid grid-cols-12 gap-5">
        {/* LEFT SIDE */}
        <div className="col-span-12 md:col-span-8 space-y-4">
          {/* CUSTOMER DETAILS */}
          <div className="bg-white rounded-xl shadow p-3 grid grid-cols-2 gap-4">
            <div>
              <label>Customer Name</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="border rounded-xl px-4 py-2 w-full mt-1"
              />
            </div>

            <div>
              <label>Phone Number</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="border rounded-xl px-4 py-2 w-full mt-1"
              />
            </div>
          </div>

          {/* SEARCH */}
          <div className="bg-white rounded-xl p-4 shadow border">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search products..."
              className="w-full h-14 pl-4 pr-4 rounded-xl border"
            />

            {searchText && (
              <div className="border rounded-xl shadow max-h-64 overflow-y-auto mt-2">
                {searchResults.length === 0 ? (
                  <p className="p-4">No products found</p>
                ) : (
                  searchResults.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => addToCart(p)}
                      className="p-4 border-b hover:bg-gray-100 cursor-pointer"
                    >
                      <p>{p.ItemName}</p>
                      <p className="text-xs text-gray-500">
                        {p.ItemCode} — ₹{p.Price}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* CART */}
          <PosCart
            cart={cart}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
            clearCart={clearCart}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-12 md:col-span-4">
          <PosSummary
            cart={cart}
            subtotal={subtotal}
            defaultSelected={defaultSelected}
            payment={payment}
            setPayment={setPayment}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            onComplete={handleCompleteBill}
            onHoldBill={handleHoldBill}
          />
        </div>
      </div>

      {/* BATCH MODAL */}
      {batchProduct && (
        <PosBatchModal
          product={batchProduct}
          onSelectBatch={(b) => addProductToCart(batchProduct, b)}
          onClose={() => setBatchProduct(null)}
        />
      )}

      {/* DRAFT MODAL */}
      {showDraftModal && (
        <DraftBillModal
          isOpen={true}
          onClose={() => setShowDraftModal(false)}
          onSelectDraft={handleLoadDraft}
        />
      )}

      {/* PREVIEW */}
      {showPreview && previewBill && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[750px] max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-xl border">

            {/* HEADER */}
            {/* HEADER */}
            <div className="flex justify-between items-start border-b pb-4">

              {/* LEFT COMPANY INFO */}
              <div>
                <h1 className="text-2xl font-bold">{defaultSelected?.namePrint || "Company Name"}</h1>

                <p className="text-sm text-gray-700">
                  {defaultSelected?.address1}, {defaultSelected?.address2}, {defaultSelected?.address3}
                </p>

                <p className="text-sm text-gray-700">
                  {defaultSelected?.city}, {defaultSelected?.state} - {defaultSelected?.pincode}
                </p>

                {defaultSelected?.mobile && (
                  <p className="text-sm text-gray-700">Mobile: {defaultSelected.mobile}</p>
                )}

                {defaultSelected?.telephone && (
                  <p className="text-sm text-gray-700">Phone: {defaultSelected.telephone}</p>
                )}

                {defaultSelected?.gstNumber && (
                  <p className="text-sm text-gray-700">GST: {defaultSelected.gstNumber}</p>
                )}

                {defaultSelected?.website && (
                  <p className="text-sm text-gray-700">Website: {defaultSelected.website}</p>
                )}
              </div>

              {/* LOGO */}
              {defaultSelected?.logo && (
                <img
                  src={defaultSelected.logo}
                  className="w-28 h-20 object-contain rounded"
                  alt="Company Logo"
                />
              )}

            </div>



            {/* BILL INFO */}
            <div className="flex justify-between mt-4 border-b pb-3">
              <div>
                <p><b>Invoice No:</b> {previewBill.billNumber}</p>
                {new Date(previewBill.createdAt || Date.now()).toLocaleString()}

              </div>

              <div>
                <p><b>Customer:</b> {previewBill.customerName || "N/A"}</p>
                <p><b>Phone:</b> {previewBill.customerPhone || "N/A"}</p>
              </div>
            </div>

            {/* ITEMS TABLE */}
            <table className="w-full mt-5 border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Batch</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">Total</th>
                </tr>
              </thead>

              <tbody>
                {previewBill.items.map((it, i) => (
                  <tr key={i} className="text-sm">
                    <td className="border p-2">{i + 1}</td>
                    <td className="border p-2">{it.name}</td>
                    <td className="border p-2">{it.batch || "-"}</td>
                    <td className="border p-2">{it.qty}</td>
                    <td className="border p-2">₹{it.price.toFixed(2)}</td>
                    <td className="border p-2 font-semibold">₹{it.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALS */}
            <div className="mt-6 text-right pr-3">
              <p className="text-sm">Subtotal: ₹{previewBill.subtotal.toFixed(2)}</p>
              <p className="text-sm">Tax: ₹{previewBill.taxAmount.toFixed(2)}</p>
              <p className="text-xl font-bold text-green-700">
                Grand Total: ₹{previewBill.grandTotal.toFixed(2)}
              </p>
            </div>

            {/* PAYMENT DETAILS */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Payment Details</h3>

              {previewBill.paymentInfo?.isSplit ? (
                <div className="text-sm space-y-1">
                  <p>Cash: ₹{previewBill.paymentInfo.splitPayment.cash}</p>
                  <p>Card: ₹{previewBill.paymentInfo.splitPayment.card}</p>
                  <p>UPI: ₹{previewBill.paymentInfo.splitPayment.upi}</p>
                </div>
              ) : (
                <p className="text-sm">Payment Mode: {previewBill.paymentInfo.singlePayment}</p>
              )}
            </div>

            {/* FOOTER */}
            <p className="text-center mt-8 text-sm text-gray-500">
              Thank you for shopping with us!
            </p>

            {/* BUTTONS */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleDownloadInvoice}
                className="bg-green-600 text-white px-4 py-2 rounded-lg w-full shadow hover:bg-green-700cursor-pointer "
              >
                Download Invoice
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg w-full hover:bg-gray-400 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
