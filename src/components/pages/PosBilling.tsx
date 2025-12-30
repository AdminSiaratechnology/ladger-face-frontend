import { useEffect, useMemo, useState, useCallback } from "react";
import { useStockItemStore } from "../../../store/stockItemStore";
import { useCompanyStore } from "../../../store/companyStore";
import { usePosStore } from "../../../store/posStore";
import { useCustomerStore } from "../../../store/customerStore";
import api from "../../api/api";

import PosCart from "./PosCart";
import PosSummary from "./PosSummary";
import PosBatchModal from "./PosBatchModal";
import DraftBillModal from "./DraftBillModal";
import ShiftEndModal from "./ShiftEndModal";
import { generateInvoicePdf } from "../../lib/invoice";
import { toast } from "sonner";
import { useProductStore } from "../../../store/productStore";

export default function PosBilling() {
  const { defaultSelected } = useCompanyStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const defaultCurrency = defaultSelected?.defaultCurrencySymbol || "₹";
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const {
    cart,
    setCart,
    customerName,
    customerPhone,
    setCustomerName,
    setCustomerPhone,
    drawerCash,
    setDrawerCash,
    addToDrawerCash,
    addDraftBill,
    loadDraftBill,
    batchProduct,
    setBatchProduct,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
  } = usePosStore();

  const [billNumber, setBillNumber] = useState("");
  const [searchText, setSearchText] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [payment, setPayment] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewBill, setPreviewBill] = useState<any>(null);
  const [searchResults,setSearchResult]=useState([]);

  const [bogoCoupons, setBogoCoupons] = useState([]);
  const {
    fetchProducts,
    filterProducts,
    products: stockItems,
    pagination,
  } = useProductStore();
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    if (!defaultSelected?._id) return;

    fetchProducts(1, 1000, defaultSelected._id);
    fetchCustomers(1, 1000, defaultSelected._id, true);
    api.getBogoCoupons(defaultSelected._id).then((res) => {
      console.log("✅ BOGO API RESPONSE:", res.data);

      setBogoCoupons(res.data || []);
    });

    const drawer = Number(localStorage.getItem("drawerCash") || 0);
    setDrawerCash(drawer);
  }, [defaultSelected?._id]);
  const fetchProductBatches = async (product) => {
    try {
      setBatchLoading(true);

      const res = await api.fetchBatches(product._id, defaultSelected?._id);

      const list = res?.data || [];

      if (list.length === 0) {
        addProductToCart(product, null);
        return;
      }

      setBatches(list);
      setBatchProduct(product);
    } catch (err) {
      console.error("❌ Failed to fetch batches", err);
      toast.error("Failed to fetch batch details");
    } finally {
      setBatchLoading(false);
    }
  };

  const products = useMemo(
    () => (Array.isArray(stockItems) ? stockItems : []),
    [stockItems]
  );

  const customerResults = useMemo(() => {
    if (!customerSearch.trim()) return [];

    const s = customerSearch.toLowerCase().trim();

    return customers.filter((c) => {
      const name = (c.customerName || "").toLowerCase();
      const phone = String(c.phoneNumber || "");
      const mobile = String(c.mobileNumber || "");
      return name.includes(s) || phone.includes(s) || mobile.includes(s);
    });
  }, [customerSearch, customers]);

  // const searchResults = useMemo(() => {
  //   if (!searchText) return [];
  //   const s = searchText.toLowerCase();
  //   console.log(s);
  //   return products.filter(
  //     (p) =>
  //       p.name.toLowerCase().includes(s) ||
  //       (p.code || "").toLowerCase().includes(s)
  //   );
  // }, [searchText, products]);

  const buyItemsKey = useMemo(() => {
    return cart
      .filter((i) => i.isFreeItem !== true)
      .map((i) => `${i.cartId}:${i.qty}`)
      .join("|");
  }, [cart]);

  useEffect(() => {
    if (!bogoCoupons?.length) return;

    const updated = applyBogoRules(cart, bogoCoupons, products);

    // 🔥 VERY IMPORTANT CHECK
    if (JSON.stringify(updated) !== JSON.stringify(cart)) {
      setCart(updated);
    }
  }, [buyItemsKey, bogoCoupons, products]);

   useEffect(() => {
      const handler = setTimeout(() => {
        if (searchText.length >= 3) {
          filterProducts(
            searchText,
            "",
            "",
            "1",
            "10",
            defaultSelected?._id
          )
            .then((result) => {
              setSearchResult(result);
            })
            .catch((err) => {
              console.error("Error filtering products:", err);
            });
        } else if (searchText.length === 0) {
          filterProducts(
            "",
            "",
            "",
            "",
            "10",
            defaultSelected?._id
          );
        }
      }, 500);
  
      return () => {
        clearTimeout(handler);
      };
    }, [
   searchText
    ]);

  function applyBogoRules(cart, bogoCoupons, products) {
    console.log("🧠 applyBogoRules START");

    // 0️⃣ remove old free items
    let updatedCart = cart.filter((i) => !i.isFreeItem);

    bogoCoupons.forEach((coupon, cIndex) => {
      if (coupon.status !== "active") return;
      if (!coupon?.bogoConfig?.rules) return;

      const today = new Date();
      const from = new Date(coupon.validFrom);
      const to = new Date(coupon.validTo);
      to.setHours(23, 59, 59, 999);
      if (today < from || today > to) return;

      coupon.bogoConfig.rules.forEach((rule, rIndex) => {
        const matchedBuyItems = updatedCart.filter((i) => {
          if (i.isFreeItem) return false;

          const key = `${i.name} (${i.code})`;
          return (
            rule.buyProducts.includes(key) ||
            rule.buyProducts.includes(i.ItemCode) ||
            rule.buyProducts.includes(String(i._id))
          );
        });

        if (matchedBuyItems.length !== rule.buyProducts.length) {
          console.log("⛔ Missing buy products");
          return;
        }
        let valid = true;

        if (rule.buyProducts.length === 1) {
          if (matchedBuyItems[0].qty < rule.buyQty) valid = false;
        } else {
          matchedBuyItems.forEach((i) => {
            if (i.qty < 1) valid = false;
          });
        }

        if (!valid) {
          console.log("⛔ Quantity condition failed");
          return;
        }

        let sets = 1;
        if (rule.buyProducts.length === 1) {
          sets = Math.floor(matchedBuyItems[0].qty / rule.buyQty);
        }

        const freeQty = sets * rule.getQty;
        if (freeQty <= 0) return;

        console.log("🎁 freeQty:", freeQty);

        const parentId = `BOGO-GROUP-${coupon._id}-${rIndex}`;
        const buyNames = matchedBuyItems.map((b) => b.ItemName).join(" and ");

        updatedCart = updatedCart.filter(
          (i) => !(i.isFreeItem && i.bogoParentId === parentId)
        );

        const freeProductId =
          rule.freeMode === "same"
            ? matchedBuyItems[0]._id
            : rule.freeProducts[0];

        const freeProduct = products.find(
          (p) =>
            String(p._id) === String(freeProductId) ||
            p.ItemCode === freeProductId ||
            `${p.ItemName} (${p.ItemCode})` === freeProductId
        );

        if (!freeProduct) {
          console.warn("⛔ Free product not found");
          return;
        }

        const lastBuyIndex = Math.max(
          ...matchedBuyItems.map((b) =>
            updatedCart.findIndex((i) => i.cartId === b.cartId)
          )
        );

        const freeItem = {
          cartId: `FREE-${freeProduct._id}-${parentId}`,
          _id: freeProduct._id,
          ItemName: `${freeProduct.ItemName} (FREE)`,
          ItemCode: freeProduct.ItemCode,
          price: 0,
          qty: freeQty,
          isFreeItem: true,
          bogoParentId: parentId,
          freeDescription: `This item is free with ${buyNames}`,
        };

        updatedCart.splice(lastBuyIndex + 1, 0, freeItem);

        console.log("✅ FREE ITEM ADDED:", freeItem);
      });
    });

    console.log("🏁 FINAL CART:", updatedCart);
    return updatedCart;
  }

  const addProductToCart = useCallback(
    (product, batch) => {
      console.log("🛒 addProductToCart CALLED:", product.code);
      const id = batch ? `${product._id}-${batch.BatchName}` : product._id;

      setCart((prev) => {
        let updatedCart = [...prev];
        const exists = updatedCart.find((x) => x.cartId === id);

        if (exists) {
          updatedCart = updatedCart.map((x) =>
            x.cartId === id ? { ...x, qty: x.qty + 1 } : x
          );
        } else {
          updatedCart.push({
            cartId: id,
            _id: product._id,
            ItemName: product.name,
            ItemCode: product.code,
            price: product.minimumRate,
            qty: 1,

            batch: batch
              ? {
                  stockItemId: batch._id,
                  batchName: batch.batchName,
                  godownName: batch.godownName,
                  availableQty: batch.availableQty,
                }
              : null,

            isFreeItem: false,
            bogoParentId: null,
          });
        }
        console.log("🛒 updatedCart:", updatedCart);
        return applyBogoRules(updatedCart, bogoCoupons, products);
      });

      setBatchProduct(null);
      setSearchText("");
    },
    [bogoCoupons, products]
  );

  const addToCart = useCallback(
    (product) => {
      if (product.batch) {
        fetchProductBatches(product);
      } else {
        addProductToCart(product, null);
      }
    },
    [addProductToCart, defaultSelected]
  );

  const subtotal = useMemo(
    () =>
      Number(
        cart
          .reduce((s, p) => {
            if (p.isFreeItem) return s;
            return s + p.qty * p.price;
          }, 0)
          .toFixed(2)
      ),
    [cart]
  );

  const gstAmount = useMemo(
    () => Number((subtotal * 0.18).toFixed(2)),
    [subtotal]
  );
  const totalAmount = subtotal + gstAmount;
  const handleHoldBill = () => {
    addDraftBill({
      id: Date.now(),
      cart,
      customerName,
      customerPhone,
      subtotal,
      gstAmount,
      totalAmount,
      createdAt: new Date().toLocaleDateString("en-CA"),
    });

    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerSearch(""); // ✅ MUST
    setPayment("");
    setCashReceived("");
    setBillNumber("---");
  };

  const handleLoadDraft = (draft) => {
    loadDraftBill(draft);
    setPayment("");
    setCashReceived("");
    setShowDraftModal(false);
  };
  const createCustomerIfNeeded = async () => {
    if (selectedCustomer?._id) {
      return selectedCustomer._id;
    }

    if (customerName || customerPhone) {
      try {
        const res = await api.createCounterCustomer({
          customerName: customerName?.trim(),
          name: customerName?.trim(),
          contactPerson: customerName?.trim(),
          phoneNumber: customerPhone?.trim(),
          companyId: defaultSelected?._id,
        });

        return res?.data?._id || null;
      } catch (err) {
        console.error("Customer create failed", err);
        toast.error("Failed to create customer");
        return null;
      }
    }

    return null;
  };

  const handleCompleteBill = async (paymentData) => {
    if (!cart || cart.length === 0) return;
    
    const paymentType = paymentData.paymentType; // Cash | Card | UPI | SPLIT
    const payments = paymentData.payments || { cash: 0, card: 0, upi: 0 };

    let cashAmount = 0;

    if (paymentType === "SPLIT") {
      cashAmount = Number(payments.cash || 0);
    } else if (paymentType === "Cash") {
      cashAmount = Number(payments.cash || paymentData.grandTotal || 0);
    }

    if (cashAmount > 0) {
      addToDrawerCash(cashAmount);
    }

    const newBillNo = "INV-" + Math.floor(100000 + Math.random() * 900000);

    const paymentInfo = {
      paymentType,
      payments: {
        cash: Number(payments.cash || 0),
        card: Number(payments.card || 0),
        upi: Number(payments.upi || 0),
      },
    };
    const customerId = await createCustomerIfNeeded();
    console.log(customerId)
    const payload = {
      billNumber: newBillNo,
      createdAt: new Date().toLocaleDateString("en-CA"),
      companyId: defaultSelected?._id,
      customer: customerId
        ? {
            customerId: customerId,
            name: customerName || null,
            phone: customerPhone || null,
          }
        : null,
      items: cart.map((i) => ({
        itemId: i._id,
        name: i.ItemName,
        code: i.ItemCode || "",
        qty: i.qty,
        price: i.price,
        total: i.qty * i.price,
        batch: {
          stockItemId: i.batch?.stockItemId.split("_")[0],
          batchName: i.batch?.batchName,
          godownName: i.batch?.godownName,
        },
      })),

      subtotal: Number(subtotal || 0),

      gstAmount: Number(paymentData.taxAmount || 0),

      totalAmount: Number(paymentData.grandTotal || 0),

      paymentInfo: {
        paymentType: paymentData.paymentType,
        payments: {
          cash: Number(paymentData.payments?.cash || 0),
          card: Number(paymentData.payments?.card || 0),
          upi: Number(paymentData.payments?.upi || 0),
        },
      },
    };
    try {
      await api.PosBillToServer(payload);
    } catch (err) {
      console.log("API ERROR:", err);
    }
    usePosStore.getState().addSale({
      time: new Date().toISOString(),
      amount: Number(paymentData.grandTotal || 0),
      billNumber: newBillNo,
      paymentMode: paymentType.toLowerCase(), // cash | card | upi | split
      split: paymentType === "SPLIT" ? paymentInfo.payments : null,
    });
    setBillNumber(newBillNo);
    setPreviewBill(payload);
    setShowPreview(true);

    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerSearch("");
    setPayment("");
    setCashReceived("");
  };

  const handleDownloadInvoice = async () => {
    if (!previewBill) return;
    await generateInvoicePdf({
      billNumber: previewBill.billNumber,
      createdAt: previewBill.createdAt,
      company: defaultSelected,
      customer: previewBill.customer,
      items: previewBill.items,
      subtotal: previewBill.subtotal,
      gstAmount: previewBill.gstAmount,
      totalAmount: previewBill.totalAmount,
      paymentInfo: previewBill.paymentInfo,
    });

    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setShowPreview(false);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-2 flex justify-between">
        <h1 className="text-lg md:text-xl font-semibold">POS Billing</h1>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 px-3 py-1 rounded-lg text-sm">
            Drawer: {defaultCurrency + " "}
            {drawerCash.toFixed(2)}
          </div>
          <button
            onClick={() => setShowShiftModal(true)}
            className="bg-white text-blue-700 px-3 py-1 rounded-lg"
          >
            Shift End
          </button>
        </div>
      </div>
      <div className="bg-white mx-3 mt-3 px-4 py-2 shadow-sm rounded-xlgrid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
        <div className="sm:justify-self-start text-center sm:text-leftpx-4 py-2 rounded-md text-sm shadow-sm">
          <span className="font-semibold">Bill No:</span> {billNumber || "----"}
        </div>

        <div className="sm:justify-self-center text-centerpx-4 py-2 rounded-md text-sm shadow-sm">
          <span className="font-semibold">Date:</span>{" "}
          {new Date().toLocaleDateString("en-CA")}
        </div>

        <div className="sm:justify-self-end text-center">
          <button
            onClick={() => setShowDraftModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
          >
            Draft Bills
          </button>
        </div>
      </div>

      <div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 space-y-4">
          <div className="bg-white p-3 rounded-xl shadow grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">
                Enter Phone Number
              </label>
              <input
                value={customerPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setCustomerPhone(val);
                }}
                placeholder="Enter Phone Number"
                className="w-full border rounded-xl px-2 py-1"
              />
            </div>

            <div className="relative">
              <label className="text-xs font-semibold">
                Enter Customer Name
              </label>
              <input
                value={customerSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomerSearch(val);
                  setCustomerName(val);
                  setShowCustomerDropdown(true);
                  setSelectedCustomer(null);
                }}
                placeholder="Enter customer Name"
                className="w-full border rounded-xl px-2 py-1"
              />

              {showCustomerDropdown && customerResults.length > 0 && (
                <div className="absolute z-50 bg-white border rounded-xl w-full max-h-48 overflow-y-auto">
                  {customerResults.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => {
                        setCustomerName(c.customerName);
                        setCustomerPhone(c.phoneNumber || c.mobileNumber);
                        setCustomerSearch(c.customerName);
                        setSelectedCustomer(c);
                        setShowCustomerDropdown(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {c.customerName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow">
            <label htmlFor="" className="text-xs font-semibold">
              Search Products
            </label>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search products"
              className="w-full border rounded-xl px-2 py-1"
            />
            {searchText && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-xl">
                {searchResults.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => addToCart(p)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <PosCart
            cart={cart}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            removeItem={removeItem}
            clearCart={clearCart}
          />
        </div>

        <div className="md:col-span-4">
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

      {batchProduct && (
        <PosBatchModal
          product={batchProduct}
          onSelectBatch={(b) => addProductToCart(batchProduct, b)}
          onClose={() => setBatchProduct(null)}
          batches={batches}
        />
      )}

      {showDraftModal && (
        <DraftBillModal
          isOpen
          onClose={() => setShowDraftModal(false)}
          onSelectDraft={handleLoadDraft}
        />
      )}

      <ShiftEndModal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
      />
      {showPreview && previewBill && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[750px] max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-xl border">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {defaultSelected?.namePrint || "Company Name"}
                </h1>

                <p className="text-sm text-gray-700">
                  {defaultSelected?.address1}, {defaultSelected?.address2},{" "}
                  {defaultSelected?.address3}
                </p>

                <p className="text-sm text-gray-700">
                  {defaultSelected?.city}, {defaultSelected?.state} -{" "}
                  {defaultSelected?.pincode}
                </p>

                {defaultSelected?.mobile && (
                  <p className="text-sm text-gray-700">
                    Mobile: {defaultSelected.mobile}
                  </p>
                )}

                {defaultSelected?.telephone && (
                  <p className="text-sm text-gray-700">
                    Phone: {defaultSelected.telephone}
                  </p>
                )}

                {defaultSelected?.gstNumber && (
                  <p className="text-sm text-gray-700">
                    GST: {defaultSelected.gstNumber}
                  </p>
                )}

                {defaultSelected?.website && (
                  <p className="text-sm text-gray-700">
                    Website: {defaultSelected.website}
                  </p>
                )}
              </div>

              {defaultSelected?.logo && (
                <img
                  src={defaultSelected.logo}
                  className="w-28 h-20 object-contain rounded"
                  alt="Company Logo"
                />
              )}
            </div>

            <div className="flex justify-between mt-4 border-b pb-3">
              <div>
                <p>
                  <b>Invoice No:</b> {previewBill.billNumber}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(previewBill.createdAt).toLocaleDateString("en-CA")}
                </p>
              </div>

              <div>
                <p>
                  <b>Customer:</b> {previewBill.customer?.name || "N/A"}
                </p>
                <p>
                  <b>Phone:</b> {previewBill.customer?.phone || "N/A"}
                </p>
              </div>
            </div>

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
                    <td className="border p-2">
                      {it.ItemName || it.name || "-"}
                    </td>
                    <td className="border p-2">
                      {it?.batch?.batchName || "-"}
                    </td>
                    <td className="border p-2">{it.qty}</td>
                    <td className="border p-2">
                      {defaultCurrency + " "}
                      {Number(it.price || 0).toFixed(2)}
                    </td>
                    <td className="border p-2 font-semibold">
                      {defaultCurrency + " "}
                      {Number((it.price || 0) * (it.qty || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTALS */}
            <div className="mt-6 text-right pr-3">
              <p className="text-sm">
                Subtotal: {defaultCurrency + " "}
                {Number(previewBill.subtotal || 0).toFixed(2)}
              </p>
              <p className="text-sm">
                Tax: {defaultCurrency + " "}
                {Number(previewBill.gstAmount || 0).toFixed(2)}
              </p>
              <p className="text-xl font-bold text-green-700">
                Grand Total: {defaultCurrency + " "}
                {Number(previewBill.totalAmount || 0).toFixed(2)}
              </p>
            </div>

            {/* PAYMENT DETAILS */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Payment Details</h3>

              <div className="text-sm space-y-1">
                <p>
                  <b>Payment Mode:</b> {previewBill.paymentInfo?.paymentType}
                </p>

                {previewBill.paymentInfo?.paymentType === "SPLIT" && (
                  <>
                    <p>
                      Cash: {defaultCurrency + " "}
                      {previewBill.paymentInfo.payments.cash}
                    </p>
                    <p>
                      Card: {defaultCurrency + " "}
                      {previewBill.paymentInfo.payments.card}
                    </p>
                    <p>
                      UPI: {defaultCurrency + " "}
                      {previewBill.paymentInfo.payments.upi}
                    </p>
                  </>
                )}
              </div>
            </div>

            <p className="text-center mt-8 text-sm text-gray-500">
              Thank you for shopping with us!
            </p>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleDownloadInvoice}
                className="bg-green-600 text-white px-4 py-2 rounded-lg w-full shadow hover:bg-green-700 cursor-pointer"
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
