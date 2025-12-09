// src/pages/CreateCoupon.jsx
import React, { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

import MultiStepNav from "../customComponents/MultiStepNav";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";

import CustomInputBox from "../customComponents/CustomInputBox";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";

import { Dialog, DialogContent } from "../ui/dialog";
import SelectedCompany from "../customComponents/SelectedCompany";
import { DatePickerField } from "../customComponents/DatePickerField";
import HeaderGradient from "../customComponents/HeaderGradint";

import { Tag, Percent, ShieldCheck, Settings } from "lucide-react";
import MultiSelect from "./MultiSelect";

import { useStockGroup } from "../../../store/stockGroupStore";
import { useStockCategory } from "../../../store/stockCategoryStore";
import { useCustomerGroupStore } from "../../../store/CustomerGroupStore";
import { useStockItemStore } from "../../../store/stockItemStore";
import { useCompanyStore } from "../../../store/companyStore";
import { toast } from "sonner";

// ------------------------------------
// STEP ICONS (ensure cursor on icons)
const stepIcons = {
  basic: <Tag className="w-4 h-4 cursor-pointer" />,
  discount: <Percent className="w-4 h-4 cursor-pointer" />,
  limits: <ShieldCheck className="w-4 h-4 cursor-pointer" />,
  rules: <Settings className="w-4 h-4 cursor-pointer" />,
};

// Coupon type options
const COUPON_TYPE_OPTIONS = [
  "Flat Discount",
  "Percentage Discount",
  "Buy One Get One",
  "Product Specific",
  "Category Specific",
  "Invoice Based",
  "Wallet Cashback",
  "Referral",
  "First Order",
  "Seasonal/Festival",
  "Delivery Fee Waiver",
  "Payment Gateway",
  "Subscription",
  "Free Shipping",
  "Cashback",
  "Store Credit",
];

export default function CreateCoupon({
  mode = "add",
  initialData = null,
  addCoupon,
  updateCoupon,
  closeModal,
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);


  // BOGO modal state
  const [showBogoModal, setShowBogoModal] = useState(false);

  // STORES & COMPANY
  const { stockGroups, fetchStockGroup } = useStockGroup();
  const { stockCategories, fetchStockCategory } = useStockCategory();
  const { groups: customerGroups, fetchGroups: fetchCustomerGroups } =
    useCustomerGroupStore();
  const { stockItems, fetchStockItems } = useStockItemStore();
  const { defaultSelected } = useCompanyStore();
  const [activeDropDown, setActiveDropDown] = useState(null);  //dropDown
  // MultiSelect single-open controller: only one multi select should be active at once
  const [activeMultiSelect, setActiveMultiSelect] = useState<string | null>(null);

  // FORM
  const [form, setForm] = useState({
    name: "",
    description: "",
    code: "",
    enableCouponType: false,
enableSchemeName: false,
schemeName: "",
couponType: "",
    discountType: null,
    discountValue: "",
    validFrom: "",
    validTo: "",
    status :"active",
    minPurchase: "",
    maxTotal: "",
    maxPerCustomer: "",
    maxPerDay: "",
    allowStacking: false,
    autoApply: false,
    stockCategories: [],
    customerGroups: [],
    stockGroups: [],
    stockItems: [],
    // optional bogo config will be stored here when saved
    bogoConfig: null,
  });

  // BOGO internal state (keeps separate settings until saved to form)
  const [bogoState, setBogoState] = useState({
    template: "", // e.g. "Buy 1 Get 1"
    buyQty: 1,
    getQty: 1,
    buyProducts: [], // product labels
    freeProducts: [],
    freeMode: "same", // same | different
    step: 1, // 1 = template, 2 = combined buy/free left-right
  });

  // initialize
useEffect(() => {
  if (initialData) {
    // EDIT or VIEW → load EXACT server data, nothing else
    setForm({ ...initialData });
  } else {
    // ADD MODE ONLY
    const today = new Date().toISOString().split("T")[0];
    setForm((p) => ({ ...p, validFrom: today }));
  }
}, [initialData, mode]);


  // fetch lists (scoped by defaultSelected._id where supported)
  useEffect(() => {
    try {
      fetchStockCategory && fetchStockCategory(1, 1000, defaultSelected?._id);
    } catch (e) { }
    try {
      fetchStockGroup && fetchStockGroup(1, 1000, defaultSelected?._id);
    } catch (e) { }
    try {
      fetchCustomerGroups && fetchCustomerGroups(defaultSelected?._id);
    } catch (e) { }
    try {
      fetchStockItems && fetchStockItems(1, 1000, defaultSelected?._id);
    } catch (e) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelected?._id]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const isView = mode === "view";
  const isEdit = mode === "edit";

  // Input formatters
  const onNameChange = (e) => {
    let val = e.target.value || "";
    val = val.replace(/[^a-z0-9]/gi, "");
    update("name", val.toUpperCase());
  };
  const onCodeChange = (e) => {
    let val = e.target.value || "";
    val = val.replace(/[^a-z0-9]/gi, "");
    update("code", val.toUpperCase());
  };

  // Date validation: Valid From cannot be in the past (Q1 -> option B)
  const handleDateChange = (name, value) => {
    if (name === "validFrom") {
      const today = new Date().toISOString().split("T")[0];
      if (value < today) {
        toast.error("Enter Valid Date...");
        return;
      }
    }
    // If validTo is set earlier than validFrom, you might want to validate as well (optional)
    if (name === "validTo" && form.validFrom) {
      if (value < form.validFrom) {
        toast.error("Valid Until Cannot be Before Valid From");
        return;
      }
    }
    update(name, value);
  };

  // Options mapping for MultiSelect (MultiSelect expects array of strings)
  const stockCategoryOptions = useMemo(
    () => (stockCategories?.map((c) => (c?.name ? c.name : c._id)) || []),
    [stockCategories]
  );
  const stockGroupOptions = useMemo(
    () => (stockGroups?.map((g) => (g?.name ? g.name : g._id)) || []),
    [stockGroups]
  );
  const customerGroupOptions = useMemo(
    () =>
      (customerGroups?.map((g) => (g?.groupName ? g.groupName : g._id)) || []),
    [customerGroups]
  );
  // productOptions show "ItemName (ItemCode)" if present
  const productOptions = useMemo(
    () =>
    (stockItems?.map((p) =>
      p?.ItemName ? `${p.ItemName} (${p.ItemCode || p._id})` : p?.ItemName || p?.name || p._id
    ) || []),
    [stockItems]
  );

  // helper: find product object by label string
  const findProductByLabel = (label) => {
    if (!label) return null;
    return stockItems?.find(
      (p) =>
        (p.ItemName && `${p.ItemName} (${p.ItemCode})` === label) ||
        p._id === label ||
        p.ItemCode === label ||
        p.ItemName === label
    );
  };

  // Per-step validation (toasts for each page)
  const validateStep = (step) => {
    if (step === "basic") {
      if (!form.name || !form.validTo) {
        toast.error("Fill required fields in Basic Details");
        return false;
      }
    } else if (step === "discount") {
      // if percentage ensure 0-100
      if (form.discountType === "PERCENT") {
        const v = Number(form.discountValue);
        if (isNaN(v) || v <= 0 || v > 100) {
          toast.error("Please enter valid discount percent (1-100)");
          return false;
        }
      }
    } else if (step === "limits") {
      // optional checks: ensure numeric if provided
      const nums = ["maxTotal", "maxPerCustomer", "maxPerDay"];
      for (const n of nums) {
        if (form[n] && isNaN(Number(form[n]))) {
          toast.error("Limits must be numeric");
          return false;
        }
      }
    } else if (step === "rules") {
      // no mandatory fields here by default, but you could enforce at least one rule
    }
    return true;
  };

  // navigation helpers that validate current step before moving
  const goNextFrom = (from) => {
    if (!validateStep(from)) return;
    if (from === "basic") setActiveTab("discount");
    else if (from === "discount") setActiveTab("limits");
    else if (from === "limits") setActiveTab("rules");
  };

  const goPreviousFrom = (from) => {
    if (from === "discount") setActiveTab("basic");
    else if (from === "limits") setActiveTab("discount");
    else if (from === "rules") setActiveTab("limits");
  };

  // submit coupon (final)
 const submit = () => {
  if (isView) return closeModal();

  const today = new Date().setHours(0, 0, 0, 0);
  const validFrom = new Date(form.validFrom).setHours(0, 0, 0, 0);
  const validTo = new Date(form.validTo).setHours(0, 0, 0, 0);

  // ---------------------
  // VALIDATION
  // ---------------------
  if (!form.name) {
    toast.error("Coupon name is required");
    return;  // ⛔ STOP SUBMIT
  }

  if (validFrom > validTo) {
    toast.error("Valid From cannot be greater than Valid To");
    return;  // ⛔ STOP SUBMIT
  }

  // ---------------------
  // ONLY AFTER VALIDATION
  // ---------------------
  const isActive = today >= validFrom && today <= validTo;

  const payload = {
    ...form,
    company: defaultSelected?._id,
    active: isActive,
  };

  // ---------------------
  // SUBMIT SHOULD HAPPEN ONLY IF VALID
  // ---------------------
  if (mode === "add") {
    addCoupon(payload);
  } else {
    updateCoupon(payload);
  }

  closeModal();
};



  // BOGO helpers
  const setBogo = (k, v) => setBogoState((p) => ({ ...p, [k]: v }));
  const applyTemplate = (buy, get) => {
    setBogo("template", `Buy ${buy} Get ${get}`);
    setBogo("buyQty", buy);
    setBogo("getQty", get);
  };
  const removeBuyProduct = (label) =>
    setBogo("buyProducts", bogoState.buyProducts.filter((x) => x !== label));
  const removeFreeProduct = (label) =>
    setBogo("freeProducts", bogoState.freeProducts.filter((x) => x !== label));
  const resetBogo = () =>
    setBogoState({
      template: "",
      buyQty: 1,
      getQty: 1,
      buyProducts: [],
      freeProducts: [],
      freeMode: "same",
      step: 1,
    });

const saveBogoToForm = () => {

  // ----------------------------------
  //  VALIDATION (TOAST + RETURN)
  // ----------------------------------

  if (!bogoState.buyProducts || bogoState.buyProducts.length === 0) {
    toast.error("Please select at least one product to buy under BOGO .");
    return;
  }

  if (bogoState.freeMode === "different" &&
      (!bogoState.freeProducts || bogoState.freeProducts.length === 0)
  ) {
    toast.error("Please select at least one free product under  BOGO.");
    return;
  }

  // ----------------------------------
  //  SAVE (ONLY IF VALID)
  // ----------------------------------
  update("bogoConfig", { ...bogoState });

  toast.success("BOGO offer saved successfully!");

  setShowBogoModal(false);
};

  // UI: selected product cards (for preview)
  const SelectedProductCards = ({ labels = [], onRemove }) => {
    return (
      <div className="space-y-3 mt-3">
        {labels.map((lbl) => {
          const p = findProductByLabel(lbl);
          return (
            <div
              key={lbl}
              className="flex items-center justify-between border rounded-lg p-3 bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  {p?.productId?.images?.[0] ? (
                    <img
                      src={p.productId.images[0]}
                      alt={p.ItemName || p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-sm text-gray-400">
                      {p?.ItemName ? p.ItemName[0] : "P"}
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-medium text-sm">{p?.ItemName || p?.name || lbl}</div>
                  <div className="text-xs text-gray-500">
                    {p?.Price ? `₹ ${p.Price}` : p?.MRP ? `₹ ${p.MRP}` : ""}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onRemove(lbl)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const tabs = [
    { id: "basic", label: "Basic Details" },
    { id: "discount", label: "Discount" },
    { id: "limits", label: "Limits" },
    { id: "rules", label: "Rules" },
  ];

  return (
    <div className="max-h-[80vh] overflow-y-auto rounded-xl">
      <Dialog open={true} onOpenChange={closeModal}>
        <DialogContent className="custom-dialog-container">
          <CustomFormDialogHeader
            title={isView ? "View Coupon" : isEdit ? "Edit Coupon" : "Add Coupon"}
          />

          <MultiStepNav steps={tabs} currentStep={activeTab} stepIcons={stepIcons} onStepChange={setActiveTab} />

          {/* BASIC */}
{activeTab === "basic" && (
  <div className="mt-4">
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* COUPON CODE */}
        <CustomInputBox
          label="Coupon Code"
          placeholder="Enter coupon code"
          value={form.code}
          readOnly={isView}
          onChange={onCodeChange}
        />

        <SelectedCompany disabled={isView} />

        {/* NAME */}
        <CustomInputBox
          label="Coupon Name *"
          placeholder="Enter coupon name (alphanumeric)"
          value={form.name}
          readOnly={isView}
          onChange={onNameChange}
        />

        {/* DESCRIPTION */}
        <CustomInputBox
          label="Coupon Description"
          placeholder="Enter coupon description"
          value={form.description}
          readOnly={isView}
          onChange={(e) => update("description", e.target.value)}
        />

        {/* ===============================
            CHECKBOXES ROW
        =============================== */}
        <div className="col-span-2 grid grid-cols-2 gap-4">

          {/* COUPON TYPE CHECKBOX */}
          <div className="flex items-center gap-2 border p-3 rounded-lg">
            <input
              type="checkbox"
              disabled={isView}
              checked={form.enableCouponType}
              onChange={(e) => update("enableCouponType", e.target.checked)}
            />
            <label className="text-sm font-medium">Coupon Type</label>
          </div>

          {/* SCHEME NAME CHECKBOX */}
          <div className="flex items-center gap-2 border p-3 rounded-lg">
            <input
              type="checkbox"
              disabled={isView}
              checked={form.enableSchemeName}
              onChange={(e) => update("enableSchemeName", e.target.checked)}
            />
            <label className="text-sm font-medium">Scheme Name</label>
          </div>

        </div>

        {/* ===============================
            COUPON TYPE DROPDOWN (Enable if checkbox ON)
        =============================== */}
        <div className={`${form.enableCouponType ? "" : "opacity-50 pointer-events-none"}`}>
          <label className="text-sm font-medium">Coupon Type *</label>

          <div
            onClick={() => {
              if (isView || !form.enableCouponType) return;
              setShowCouponDropdown(!showCouponDropdown);
            }}
            className={`border rounded-lg w-full h-12 px-3 mt-1 flex items-center justify-between 
              bg-white shadow-sm ${isView ? "cursor-default" : "cursor-pointer hover:shadow-md"}`}
          >
            <span className={`${!form.couponType ? "text-slate-400" : ""}`}>
              {form.couponType || "Select Coupon Type"}
            </span>

            {!isView && form.enableCouponType && (
              <span className="text-gray-500">⌄</span>
            )}
          </div>

          {showCouponDropdown && !isView && form.enableCouponType && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {COUPON_TYPE_OPTIONS.map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    update("couponType", item);
                    setShowCouponDropdown(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-teal-50 
                    ${form.couponType === item ? "bg-teal-100 font-medium" : ""}`}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===============================
            SCHEME NAME FIELD (Enable if checkbox ON)
        =============================== */}
        <div className={`${form.enableSchemeName ? "" : "opacity-50 pointer-events-none"}`}>
          <CustomInputBox
            label="Scheme Name"
            placeholder="Enter scheme name"
            value={form.schemeName || ""}
            readOnly={isView}
            onChange={(e) => update("schemeName", e.target.value)}
          />
        </div>

        {/* DATE FIELDS */}
        <DatePickerField
          label="Valid From"
          name="validFrom"
          value={form.validFrom}
          readOnly={isView}
          disabled={isView}
          onChange={(e) => !isView && handleDateChange("validFrom", e.target.value)}
        />

        <DatePickerField
          label="Valid Until *"
          name="validTo"
          value={form.validTo}
          readOnly={isView}
          disabled={isView}
          onChange={(e) => !isView && handleDateChange("validTo", e.target.value)}
        />
        <div>
  <label className="text-sm font-medium">Status</label>
  <select
    disabled={isView}
    className="border rounded-lg w-full h-12 px-3 mt-1"
    value={form.status || ""}
    onChange={(e) => update("status", e.target.value)}
  >
    <option value="">Select Status</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
</div>

      </CardContent>
    </Card>

    {/* FOOTER NAVIGATION */}
    {!isView && (
      <CustomStepNavigation
        currentStep={1}
        totalSteps={4}
        onNext={() => goNextFrom("basic")}
        onSubmit={submit}
      />
    )}
    {isView && (
      <CustomStepNavigation
        currentStep={1}
        totalSteps={4}
        onNext={() => goNextFrom("basic")}
        isSubmit={false}
      />
    )}
  </div>
)}





          {/* DISCOUNT */}
          {activeTab === "discount" && (
            <div className="mt-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="text-sm font-medium">Discount Type</label>
                    <select
                      disabled={isView}
                      className="border p-2 rounded-lg w-full mt-1 h-12"
                      value={form.discountType}
                      onChange={(e) => update("discountType", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="FIXED">Flat Amount</option>
                      <option value="PERCENT">Percentage (%)</option>
                    </select>
                  </div>

                  {/* ======== UPDATED DISCOUNT VALUE WITH % SUFFIX ========== */}
                  <div className="relative">
                    <CustomInputBox
                      label="Discount Value *"
                      placeholder="e.g., 50"
                      type="number"
                      value={form.discountValue}
                      readOnly={isView}
                      onChange={(e) => update("discountValue", e.target.value)}
                      style={{
                        paddingRight: form.discountType === "PERCENT" ? "26px" : "",
                      }}
                    />

                    {form.discountType === "PERCENT" && (
                      <span className="absolute right-3 top-9 text-gray-500 font-medium">
                        %
                      </span>
                    )}
                  </div>

                  <CustomInputBox
                    label="Min Order Value"
                    placeholder="e.g., 500"
                    type="number"
                    value={form.minPurchase}
                    readOnly={isView}
                    onChange={(e) => update("minPurchase", e.target.value)}
                  />

                  <div>
                    <label className="text-sm font-medium">Tax Apply</label>
                    <select
                      disabled={isView}
                      value={form.taxApply}
                      onChange={(e) => update("taxApply", e.target.value)}
                      className="border p-2 rounded-lg w-full mt-1 h-12"
                    >
                      <option value="before">Before Tax</option>
                      <option value="after">After Tax</option>
                    </select>
                  </div>

                </CardContent>
              </Card>

              {!isView && (
                <CustomStepNavigation
                  currentStep={2}
                  totalSteps={4}
                  onPrevious={() => goPreviousFrom("discount")}
                  onNext={() => goNextFrom("discount")}
                  onSubmit={submit}
                />
              )}
              {isView && (
                <CustomStepNavigation
                  currentStep={2}
                  totalSteps={4}
                  onPrevious={() => goPreviousFrom("discount")}
                  onNext={() => goNextFrom("discount")}
                  isSubmit={false}
                />
              )}
            </div>
          )}


          {/* LIMITS */}
          {activeTab === "limits" && (
            <div className="mt-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Max Total Redemptions"
                    placeholder="e.g., 1000"
                    type="number"
                    value={form.maxTotal}
                    readOnly={isView}
                    onChange={(e) => update("maxTotal", e.target.value)}
                  />

                  <CustomInputBox
                    label="Max Per Customer"
                    placeholder="e.g., 1"
                    type="number"
                    value={form.maxPerCustomer}
                    readOnly={isView}
                    onChange={(e) => update("maxPerCustomer", e.target.value)}
                  />

                  <CustomInputBox
                    label="Max Per Day"
                    placeholder="e.g., 50"
                    type="number"
                    value={form.maxPerDay}
                    readOnly={isView}
                    onChange={(e) => update("maxPerDay", e.target.value)}
                  />

                  <div className="col-span-2 flex items-center justify-between border rounded-lg p-3">
                    <p className="text-sm font-medium">Allow Stacking</p>
                    <input
                      disabled={isView}
                      type="checkbox"
                      checked={form.allowStacking}
                      onChange={(e) => update("allowStacking", e.target.checked)}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-between border rounded-lg p-3">
                    <p className="text-sm font-medium">Auto Apply</p>
                    <input
                      disabled={isView}
                      type="checkbox"
                      checked={form.autoApply}
                      onChange={(e) => update("autoApply", e.target.checked)}
                      className="cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>

              {!isView && (
                <CustomStepNavigation
                  currentStep={3}
                  totalSteps={4}
                  onPrevious={() => goPreviousFrom("limits")}
                  onNext={() => goNextFrom("limits")}
                  onSubmit={submit}
                />
              )}
              {isView && (
                <CustomStepNavigation
                  currentStep={3}
                  totalSteps={4}
                  onPrevious={() => goPreviousFrom("limits")}
                  onNext={() => goNextFrom("limits")}
                  isSubmit={false}
                />
              )}
            </div>
          )}

          {/* RULES */}
          {activeTab === "rules" && (
            <div className="mt-4">
              <Card>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MultiSelect
                    label="Stock Categories"
                    options={stockCategoryOptions}
                    selected={form.stockCategories}
                    onChange={(v) => update("stockCategories", v)}
                    disabled={isView}
                    // controller prop for single-open behavior (your MultiSelect can use it if implemented)
                    controller={{ id: "stockCategories", activeMultiSelect, setActiveMultiSelect }}
                  />

                  <MultiSelect
                    label="Customer Groups"
                    options={customerGroupOptions}
                    selected={form.customerGroups}
                    onChange={(v) => update("customerGroups", v)}
                    disabled={isView}
                    controller={{ id: "customerGroups", activeMultiSelect, setActiveMultiSelect }}
                  />

                  <MultiSelect
                    label="Stock Groups"
                    options={stockGroupOptions}
                    selected={form.stockGroups}
                    onChange={(v) => update("stockGroups", v)}
                    disabled={isView}
                    controller={{ id: "stockGroups", activeMultiSelect, setActiveMultiSelect }}
                  />

                  <MultiSelect
                    label="Products"
                    options={productOptions}
                    selected={form.stockItems}
                    onChange={(v) => update("stockItems", v)}
                    disabled={isView}
                    controller={{ id: "products", activeMultiSelect, setActiveMultiSelect }}
                  />

                  {/* BOGO customization prompt */}
                  {form.couponType === "Buy One Get One" && (
                    <div className="col-span-2 p-4 border rounded-lg bg-teal-50 mt-4">
                      <p className="text-sm font-medium text-teal-800 mb-2">
                        View and Edit Buy One Get One
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          // open modal and prefill bogoState if previously saved
                          const saved = form.bogoConfig;
                          if (saved) setBogoState((s) => ({ ...s, ...saved }));
                          setShowBogoModal(true);
                        }}
                        className="text-teal-700 underline hover:text-teal-900 cursor-pointer"
                      >
                        Buy One Get One Offer →
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isView && (
                <CustomStepNavigation
                  currentStep={4}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("discount")}
                  onSubmit={submit}
                />
              )}
              {isView && (
                <CustomStepNavigation
                  currentStep={4}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("discount")}
                  onNext={() => closeModal()}
                  isSubmit={false}
                />
              )}
            </div>
          )}

          {/* BOGO Modal - simplified and left-right combined for buy & free (Q3 -> left-right) */}
          <Dialog open={showBogoModal} onOpenChange={(open) => {
            setShowBogoModal(open);   // modal open/close update

            if (!open) {
              // modal band hua → step reset
              setBogoState((prev) => ({ ...prev, step: 1 }));
            }
          }}>
            <DialogContent
              className="
      custom-dialog-container max-w-3xl
      !transition-none !transform-none !duration-0 !ease-none !animate-none
    "
              style={{
                animation: "none",
                transition: "none",
                transform: "none",
              }}
            >
              <div className="space-y-4">
                <HeaderGradient
                  title="Customize Buy One Get One Offer"
                  subtitle="Configure BOGO offer according to your needs"
                />
                {isView && (
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm font-medium flex items-center gap-2">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12" y2="16"></line>
                    </svg>
                    This BOGO offer is in <strong className="font-semibold">View Mode</strong>. All fields are read-only.
                  </div>
                )}


                {/* ================= STEP PILLS ================= */}
                <div className="flex items-center gap-3 text-sm">
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      onClick={() => setBogoState((p) => ({ ...p, step: s }))} // ⭐ Steps always clickable
                      className={`px-3 py-1 rounded-full cursor-pointer ${bogoState.step === s
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      Step {s}
                    </div>
                  ))}
                </div>

                {/* ================= STEP 1 ================= */}
                {bogoState.step === 1 && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* LEFT */}
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Quick Templates</p>

                          <div className="grid grid-cols-2 gap-3">
                            {[{ buy: 1, get: 1 }, { buy: 2, get: 1 }, { buy: 3, get: 1 }, { buy: 1, get: 2 }].map(
                              (tpl, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    if (isView) return; // ⭐ View mode no click
                                    applyTemplate(tpl.buy, tpl.get);
                                  }}
                                  className="p-4 border rounded-lg cursor-pointer hover:shadow transition"
                                >
                                  Buy {tpl.buy} Get {tpl.get} FREE
                                </div>
                              )
                            )}
                          </div>

                          {/* ⭐ Updated BOLD heading */}
                          <p className="text-base font-bold text-gray-900 tracking-wide mt-5 mb-2">
                            OR CREATE CUSTOM
                          </p>

                          <div className="grid grid-cols-2 gap-3 items-center">
                            <input
                              type="number"
                              min={1}
                              disabled={isView}
                              readOnly={isView}
                              value={bogoState.buyQty}
                              onChange={(e) => setBogo("buyQty", Number(e.target.value || 1))}
                              className="w-full px-4 py-3 border rounded-lg"
                              placeholder="Buy Quantity"
                            />

                            <input
                              type="number"
                              min={1}
                              disabled={isView}
                              readOnly={isView}
                              value={bogoState.getQty}
                              onChange={(e) => setBogo("getQty", Number(e.target.value || 1))}
                              className="w-full px-4 py-3 border rounded-lg"
                              placeholder="Get Quantity"
                            />
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Preview</p>

                          <div className="rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 text-white p-6">
                            <div className="text-center">
                              <div className="text-xl font-semibold">
                                Buy {bogoState.buyQty} Get {bogoState.getQty} FREE
                              </div>
                              <div className="text-sm opacity-90 mt-2">
                                {bogoState.freeMode === "same"
                                  ? "Same product will be FREE"
                                  : "Selected products will be FREE"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Buttons hidden in view mode */}
                      {!isView && (
                        <div className="flex justify-end gap-3 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => {
                              resetBogo();
                              setShowBogoModal(false);
                            }}
                          >
                            Cancel
                          </Button>

                          <Button onClick={() => setBogo("step", 2)}>Next</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* ================= STEP 2 ================= */}
                {bogoState.step === 2 && (
                  <Card className="rounded-xl shadow-sm border">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* BUY SIDE */}
                        <div className="p-5 border rounded-xl bg-white shadow-sm">
                          <p className="text-xl font-semibold mb-2 text-gray-800">Products to Buy</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Customer must buy {bogoState.buyQty} product(s)
                          </p>

                          <MultiSelect
                            label="Products to Buy"
                            options={productOptions}
                            selected={bogoState.buyProducts}
                            onChange={(v) => setBogo("buyProducts", v)}
                            disabled={isView}
                            controller={{
                              id: "bogoBuy",
                              activeMultiSelect,
                              setActiveMultiSelect,
                            }}
                          />

                          <div className="mt-4 space-y-2">
                            {bogoState.buyProducts.map((lbl) => (
                              <div
                                key={lbl}
                                className="flex items-center justify-between border p-3 rounded-lg"
                              >
                                <span>{lbl}</span>

                                {!isView && (
                                  <button
                                    onClick={() => removeBuyProduct(lbl)}
                                    className="text-red-500 text-sm"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* FREE SIDE */}
                        <div className="p-5 border rounded-xl bg-white shadow-sm">
                          <p className="text-xl font-semibold mb-2 text-gray-800">Free Products</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Customer gets {bogoState.getQty} FREE items
                          </p>

                          {/* FREE MODE buttons */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div
                              onClick={() => {
                                if (isView) return;
                                setBogo("freeMode", "same");
                              }}
                              className={`p-4 rounded-lg border cursor-pointer transition ${bogoState.freeMode === "same"
                                ? "bg-green-50 border-green-400 shadow-sm"
                                : "hover:bg-gray-50"
                                }`}
                            >
                              <div className="font-medium text-gray-800">Same Product</div>
                            </div>

                            <div
                              onClick={() => {
                                if (isView) return;
                                setBogo("freeMode", "different");
                              }}
                              className={`p-4 rounded-lg border cursor-pointer transition ${bogoState.freeMode === "different"
                                ? "bg-green-50 border-green-400 shadow-sm"
                                : "hover:bg-gray-50"
                                }`}
                            >
                              <div className="font-medium text-gray-800">Different Products</div>
                            </div>
                          </div>

                          {bogoState.freeMode === "different" && (
                            <>
                              <MultiSelect
                                label="Free Products"
                                options={productOptions}
                                selected={bogoState.freeProducts}
                                onChange={(v) => setBogo("freeProducts", v)}
                                disabled={isView}
                                controller={{
                                  id: "bogoFree",
                                  activeMultiSelect,
                                  setActiveMultiSelect,
                                }}
                              />

                              <div className="mt-4 space-y-2">
                                {bogoState.freeProducts.map((lbl) => (
                                  <div
                                    key={lbl}
                                    className="flex items-center justify-between border p-3 rounded-lg"
                                  >
                                    <span>{lbl}</span>

                                    {!isView && (
                                      <button
                                        onClick={() => removeFreeProduct(lbl)}
                                        className="text-red-500 text-sm"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {!isView && (
                        <div className="flex justify-between mt-8">
                          <Button variant="outline" onClick={() => setBogo("step", 1)}>
                            Back
                          </Button>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                resetBogo();
                                setShowBogoModal(false);
                              }}
                            >
                              Cancel
                            </Button>

                            <Button onClick={() => saveBogoToForm()}>Save Offer</Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>


        </DialogContent>
      </Dialog>
    </div>
  );
}
