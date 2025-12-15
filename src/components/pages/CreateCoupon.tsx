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
    status: "active",
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
    productFreeMapping: {}
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
    if (!form.validTo) {
      toast.error("Valid Until date is required");
      return;
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
  const removeBuyProduct = (label) => {
    // remove from buyProducts
    setBogo("buyProducts", bogoState.buyProducts.filter((x) => x !== label));

    // remove its free mapping also
    setBogoState((prev) => {
      const updated = { ...prev.productFreeMapping };
      delete updated[label];

      return {
        ...prev,
        productFreeMapping: updated,
      };
    });
  };


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
      productFreeMapping: {}   // ✅ added
    });

  const saveBogoToForm = () => {

    // ----------------------------------
    //  VALIDATION (TOAST + RETURN)
    // ----------------------------------

    if (!bogoState.buyProducts || bogoState.buyProducts.length === 0) {
      toast.error("Please select at least one product to buy under BOGO .");
      return;
    }

    if (bogoState.freeMode === "different") {
      const hasAtLeastOneMapping = Object.values(
        bogoState.productFreeMapping || {}
      ).some((arr) => Array.isArray(arr) && arr.length > 0);

      if (!hasAtLeastOneMapping) {
        toast.error("Please select at least one free product under BOGO.");
        return;
      }
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

        <MultiStepNav
  steps={tabs}
  currentStep={activeTab}
  onStepChange={(nextTab) => {
    const stepOrder = [
      "basic",
      "discount",
      "rules",
      "limits",
    ];

    const currentIndex = stepOrder.indexOf(activeTab);
    const nextIndex = stepOrder.indexOf(nextTab);

    // Backward navigation is always allowed
    if (nextIndex < currentIndex) {
      setActiveTab(nextTab);
      return;
    }

    // Forward navigation requires validation
    // Step 1: Basic Information validation
    if (activeTab === "basic") {
      if (!form.name?.trim()) {
        toast.error("Coupon name is required");
        return;
      }
      
      if (!form.validTo) {
        toast.error("Coupon type is required");
        return;
      }
    }

    setActiveTab(nextTab);
  }}
  stepIcons={stepIcons}
/>

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
                    <label className="text-sm font-medium">Coupon Type </label>

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
  setShowBogoModal(open);
}}>
  <DialogContent
    className="custom-dialog-container max-w-5xl !transition-none !transform-none !duration-0 !ease-none !animate-none p-0 overflow-visible"
    style={{
      animation: "none",
      transition: "none",
      transform: "none",
    }}
  >
    {/* Elegant Header */}
    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-t-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Configure BOGO Offer</h2>
          <p className="text-indigo-100 text-sm mt-0.5">Set up your buy one get one promotion</p>
        </div>
        <button
          onClick={() => setShowBogoModal(false)}
          className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    {isView && (
      <div className="mx-5 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm">View mode - All fields are read-only</span>
      </div>
    )}

    <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
      {/* Offer Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Template Selection */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Quick Templates</h3>
                <p className="text-xs text-gray-500">Choose a preset for new products</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[{ buy: 1, get: 1 }, { buy: 2, get: 1 }, { buy: 3, get: 1 }, { buy: 1, get: 2 }].map(
                (tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isView) return;
                      // Apply template to GLOBAL defaults only
                      setBogoState(prev => ({
                        ...prev,
                        buyQty: tpl.buy,
                        getQty: tpl.get
                      }));
                    }}
                    className={`p-3 border rounded-lg text-center transition-all cursor-pointer ${
                      bogoState.buyQty === tpl.buy && bogoState.getQty === tpl.get
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800">Buy {tpl.buy}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Get {tpl.get} Free</div>
                  </button>
                )
              )}
            </div>

            {/* Global Default Quantities */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Default Quantities (for new products)</span>
                <span className="text-xs text-gray-500">Applied when adding new products</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Buy Quantity</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      disabled={isView}
                      readOnly={isView}
                      value={bogoState.buyQty}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setBogoState(prev => ({
                          ...prev,
                          buyQty: val
                        }));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Get Free Quantity</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      disabled={isView}
                      readOnly={isView}
                      value={bogoState.getQty}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setBogoState(prev => ({
                          ...prev,
                          getQty: val
                        }));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products to Buy */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Select Products to Buy</h3>
                <p className="text-xs text-gray-500">Add products to configure BOGO offers</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Add Products</label>
                <span className="text-xs text-gray-500">
                  {bogoState.buyProducts.length} selected
                </span>
              </div>
              <div className="relative">
                <MultiSelect
                  options={productOptions.filter(option => !bogoState.buyProducts.includes(option))}
                  selected={[]}
                  onChange={(v) => {
                    // Always allow multiple products
                    const newProducts = [...bogoState.buyProducts, ...v];
                    setBogo("buyProducts", newProducts);
                    
                    // Initialize productQuantities for NEW products using CURRENT global defaults
                    const newQuantities = { ...bogoState.productQuantities };
                    const newMapping = { ...bogoState.productFreeMapping };
                    
                    v.forEach(product => {
                      if (!newQuantities[product]) {
                        // Use CURRENT global defaults (from bogoState.buyQty/getQty)
                        newQuantities[product] = { 
                          buyQty: bogoState.buyQty,
                          getQty: bogoState.getQty
                        };
                      }
                      if (!newMapping[product]) {
                        newMapping[product] = [];
                      }
                    });
                    
                    setBogoState(prev => ({
                      ...prev,
                      productQuantities: newQuantities,
                      productFreeMapping: newMapping
                    }));
                  }}
                  disabled={isView}
                  controller={{
                    id: "bogoBuy",
                    activeMultiSelect,
                    setActiveMultiSelect,
                  }}
                  dropdownClassName="!z-[10000]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Preview Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div className="text-lg font-semibold mb-1">
               Buy {bogoState.buyQty} Get {bogoState.getQty} Free
              </div>
              <div className="text-indigo-100 text-xs">
                Applied to new products only
              </div>
            </div>
          </div>

          {/* Free Mode Selection */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">Free Product Type</h3>
                <p className="text-xs text-gray-500">Choose free product option</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  if (isView) return;
                  setBogo("freeMode", "same");
                  // Clear all free product mappings when switching to same product mode
                  setBogoState(prev => ({
                    ...prev,
                    productFreeMapping: {}
                  }));
                }}
                className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  bogoState.freeMode === "same"
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    bogoState.freeMode === "same" ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                  }`}>
                    {bogoState.freeMode === "same" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Same Product</div>
                    <div className="text-xs text-gray-500">Get same product for free</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (isView) return;
                  setBogo("freeMode", "different");
                }}
                className={`w-full p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  bogoState.freeMode === "different"
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    bogoState.freeMode === "different" ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                  }`}>
                    {bogoState.freeMode === "different" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Different Products</div>
                    <div className="text-xs text-gray-500">Select different free products</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOGO Configuration Table */}
      {bogoState.buyProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-visible">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800">Configured Products</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {bogoState.buyProducts.length} product(s) configured • Each product can have different BOGO rules
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {bogoState.buyProducts.map((buyProductLabel, index) => {
              const buyProduct = findProductByLabel(buyProductLabel);
              
              // Get per-product quantities (default to global if not set)
              const productQuantities = bogoState.productQuantities?.[buyProductLabel] || { 
                buyQty: bogoState.buyQty, 
                getQty: bogoState.getQty 
              };
              
              return (
                <div key={buyProductLabel} className="p-4 hover:bg-gray-50/50 transition-colors relative">
                  <div className="grid grid-cols-12 gap-4">
                    {/* Buy Product */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden border border-blue-100">
                            {buyProduct?.productId?.images?.[0] ? (
                              <img
                                src={buyProduct.productId.images[0]}
                                alt={buyProduct?.ItemName || buyProduct?.name || buyProductLabel}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-sm font-medium text-blue-400">
                                {buyProduct?.ItemName ? buyProduct.ItemName[0] : "P"}
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {buyProduct?.ItemName || buyProduct?.name || buyProductLabel}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {buyProduct?.ItemCode && (
                              <span className="text-xs text-gray-500">#{buyProduct.ItemCode}</span>
                            )}
                            {buyProduct?.Price && (
                              <span className="text-sm font-medium text-gray-700">₹{buyProduct.Price}</span>
                            )}
                          </div>
                          
                          {/* BOGO badge display */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                              Buy {productQuantities.buyQty}
                            </div>
                            <div className="text-gray-400 text-xs">→</div>
                            <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md">
                              Get {productQuantities.getQty} Free
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Free Products */}
                    <div className="col-span-6">
                      {bogoState.freeMode === "same" ? (
                        <div className="h-full flex items-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium">Same Product</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-gray-600">Free products</label>
                            <span className="text-xs text-gray-500">Up to {productQuantities.getQty}</span>
                          </div>

                          {/* MultiSelect with proper z-index */}
                          <div className="relative" style={{ zIndex: 1000 - index }}>
                            <MultiSelect
                            
                              options={productOptions.filter(option => {
                                const currentFreeProducts = bogoState.productFreeMapping?.[buyProductLabel] || [];
                                if (currentFreeProducts.includes(option)) return true;
                                const isAlreadyFreeInOtherRows = Object.entries(bogoState.productFreeMapping || {})
                                  .filter(([key]) => key !== buyProductLabel)
                                  .some(([_, freeProducts]) => freeProducts.includes(option));
                                return !isAlreadyFreeInOtherRows;
                              })}
                              selected={bogoState.productFreeMapping?.[buyProductLabel] || []}
                              onChange={(v) => {
                                if (v.length > productQuantities.getQty) {
                                  toast.error(`Maximum ${productQuantities.getQty} free product(s) allowed`);
                                  return;
                                }
                                setBogoState(prev => ({
                                  ...prev,
                                  productFreeMapping: {
                                    ...prev.productFreeMapping,
                                    [buyProductLabel]: v
                                  }
                                }));
                              }}
                              disabled={isView}
                              controller={{
                                id: `bogoFree-${buyProductLabel}-${index}`,
                                activeMultiSelect,
                                setActiveMultiSelect,
                              }}
                              dropdownClassName="!z-[10000]"
                            />
                          </div>

                          {bogoState.productFreeMapping?.[buyProductLabel]?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {bogoState.productFreeMapping[buyProductLabel].map(freeLabel => {
                                const freeProduct = findProductByLabel(freeLabel);
                                return (
                                  <div key={freeLabel} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded text-xs">
                                    <span className="truncate max-w-[120px]">
                                      {freeProduct?.ItemName || freeProduct?.name || freeLabel}
                                    </span>
                                    {freeProduct?.Price && (
                                      <span className="font-medium whitespace-nowrap">₹{freeProduct.Price}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1 flex items-center justify-center">
                      {!isView && (
                        <button
                          type="button"
                          onClick={() => removeBuyProduct(buyProductLabel)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary & Actions */}
      <div className="space-y-4">
        {bogoState.buyProducts.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800 mb-1">Offer Summary</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {bogoState.buyProducts.length} product(s) configured with individual BOGO rules.
                  Template changes only affect new products. Existing products keep their individual settings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {bogoState.buyProducts.length > 0 ? (
              <span>{bogoState.buyProducts.length} product(s) configured</span>
            ) : (
              <span>No products selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetBogo();
                setShowBogoModal(false);
              }}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => saveBogoToForm()}
              className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all font-medium shadow-sm cursor-pointer"
            >
              Save Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
        </DialogContent>
      </Dialog>
    </div>
  );
}
