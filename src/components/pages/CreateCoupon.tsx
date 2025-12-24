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

import { Tag, Percent, ShieldCheck, Settings, X, Trash2 } from "lucide-react";
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
  const [showLivePreview, setShowLivePreview] = useState(false);

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
    bogoConfig: {
      rules: [],   // 👈 TEMP rules (UI only)
    }

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


  const addRuleToPreview = () => {
    if (bogoState.buyProducts.length === 0) {
      toast.error("Please select buy products");
      return;
    }

    if (
      bogoState.freeMode === "different" &&
      bogoState.getQty > 0 &&
      Object.values(bogoState.productFreeMapping).flat().length === 0
    ) {
      toast.error("Please select free products");
      return;
    }

    const rule = {
      buyQty: bogoState.buyQty,
      getQty: bogoState.getQty,
      buyProducts: [...bogoState.buyProducts],
      freeMode: bogoState.freeMode,
      freeProducts:
        bogoState.freeMode === "same"
          ? []
          : Object.values(bogoState.productFreeMapping).flat(),
    };

    setForm(prev => ({
      ...prev,
      bogoConfig: {
        ...prev.bogoConfig,
        rules: [...(prev.bogoConfig.rules || []), rule],
      },
    }));

    // reset current selection
    setBogoState(prev => ({
      ...prev,
      buyProducts: [],
      productFreeMapping: {},
    }));

    toast.success("Rule added");
  };

const publishOffer = () => {
  if (!form?.bogoConfig?.rules?.length) {
    toast.error("Please add at least one rule");
    return;
  }

  // 🔍 Optional debug
  console.log("BOGO SAVED IN FORM 👉", form.bogoConfig);

  // 👉 YAHAN API CALL NAHI
  setShowBogoModal(false);

  toast.success("BOGO offer added successfully");
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

  const calculateMaxSavings = () => {
    let total = 0;

    form?.bogoConfig?.rules?.forEach(rule => {
      rule.buyProducts.forEach(p => {
        const prod = findProductByLabel(p);
        if (prod?.Price) {
          total += prod.Price * rule.getQty;
        }
      });
    });

    return total.toLocaleString();
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
                  toast.error("Valid Until Date is required");
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
                      label="Discount Value "
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


          {/* BOGO Modal */}
          <Dialog open={showBogoModal} onOpenChange={setShowBogoModal}>
            <DialogContent
              className="custom-dialog-container max-w-6xl p-0 overflow-hidden"
              style={{
                backdropFilter: "blur(4px)",
                backgroundColor: "rgba(255,255,255,0.95)",
              }}
            >
              {/* ================= HEADER ================= */}
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Configure BOGO Offer
                    </h2>
                    <p className="text-indigo-100 text-sm mt-0.5">
                      Set up your buy one get one promotion
                    </p>
                  </div>


                </div>
              </div>






              {/* ================= BODY ================= */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh] bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowLivePreview(prev => !prev)}
                  className={`w-full rounded-xl py-3 px-4
    flex items-center justify-center gap-2
    font-semibold transition-all duration-200
    border
    ${showLivePreview
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-300 hover:shadow-md"
                    }
  `}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5
         c4.478 0 8.268 2.943 9.542 7
         -1.274 4.057-5.064 7-9.542 7
         -4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>

                  {showLivePreview ? "Hide Live Preview" : "Show Live Preview"}
                </button>
                {showLivePreview && (
                  <div className="mt-4 rounded-2xl
                  bg-gradient-to-r from-purple-500 to-pink-500
                  p-[2px]">

                    <div className="bg-white rounded-2xl p-6">

                      {/* HEADER */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-purple-100
                          flex items-center justify-center text-purple-600">
                            👁️
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">Live Preview</h3>
                            <p className="text-xs text-gray-500">
                              Customer-facing offer view
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowLivePreview(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>

                      {/* OFFER NAME */}
                      <div className="text-center mb-4">
                        <h4 className="text-base font-semibold">
                          Your Offer Name
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          OFFER DETAILS
                        </p>
                      </div>

                      {/* RULE CARDS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {form?.bogoConfig?.rules?.map((rule, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-indigo-600
                              text-white text-xs flex items-center justify-center">
                                {index + 1}
                              </div>
                              <span className="text-sm font-semibold">
                                Buy {rule.buyQty} – Get {rule.getQty} FREE
                              </span>
                            </div>

                            <div className="text-xs text-gray-600">
                              • {rule.buyProducts.join(", ")}
                            </div>

                            {rule.freeMode === "different" && (
                              <div className="text-xs text-gray-600 mt-1">
                                • Free: {rule.freeProducts.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* MAX SAVINGS */}
                      <div className="mt-4 bg-green-50 border border-green-200
                      rounded-lg p-3 text-center text-sm
                      font-semibold text-green-700">
                        Max Savings: ₹{calculateMaxSavings()}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== BUY / FREE QUANTITY ===== */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <h3 className="text-base font-semibold text-blue-800 mb-4">
                    Configure New Offer Rule
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Buy Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        disabled={isView}
                        readOnly={isView}
                        value={bogoState.buyQty}
                        onChange={(e) => {
                          if (isView) return;
                          setBogo("buyQty", Math.max(1, +e.target.value || 1));
                        }}
                        className="w-full mt-1 px-3 py-2 border rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Get FREE Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        disabled={isView}
                        readOnly={isView}
                        value={bogoState.getQty}
                        onChange={(e) => {
                          if (isView) return;
                          setBogo("getQty", Math.max(1, +e.target.value || 1));
                        }}
                        className="w-full mt-1 px-3 py-2 border rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* ===== PRODUCTS BUY / FREE ===== */}
                <div className="grid grid-cols-2 gap-6">

                  {/* PRODUCTS TO BUY */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <label className="text-sm font-medium mb-3 block">
                      Products to Buy <span className="text-red-500">*</span>
                    </label>

                    <MultiSelect
                      disabled={isView}
                      options={productOptions.filter(
                        (p) => !bogoState.buyProducts.includes(p)
                      )}
                      selected={[]}
                      onChange={(v) => {
                        if (isView) return;

                        const next = [...bogoState.buyProducts, ...v];
                        if (next.length > bogoState.buyQty) {
                          toast.error(
                            `You can select maximum ${bogoState.buyQty} buy product(s)`
                          );
                          return;
                        }

                        setBogo("buyProducts", next);
                      }}
                      controller={{
                        id: "bogoBuy",
                        activeMultiSelect,
                        setActiveMultiSelect,
                      }}
                      placeholder="Search products..."
                    />

                    <div className="mt-4 border rounded-lg divide-y">
                      {bogoState.buyProducts.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">
                          No products selected
                        </div>
                      ) : (
                        bogoState.buyProducts.map((label) => {
                          const p = findProductByLabel(label);
                          return (
                            <div key={label} className="flex justify-between p-3">
                              <div>
                                <div className="text-sm font-medium">
                                  {p?.ItemName || label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ₹{p?.Price}
                                </div>
                              </div>

                              {!isView && (
                                <button onClick={() => removeBuyProduct(label)}>
                                  <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* FREE PRODUCTS */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <label className="text-sm font-medium mb-3 block">
                      Free Products
                    </label>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3 flex gap-3">
                      <input
                        type="checkbox"
                        disabled={isView}
                        checked={bogoState.freeMode === "same"}
                        onChange={() => {
                          if (isView) return;
                          setBogo(
                            "freeMode",
                            bogoState.freeMode === "same" ? "different" : "same"
                          );
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium">
                          Same as Buy Products
                        </div>
                        <div className="text-xs text-gray-600">
                          Customer gets the same product free
                        </div>
                      </div>
                    </div>

                    {bogoState.freeMode === "different" && (
                      <MultiSelect
                        disabled={isView}
                        options={productOptions.filter(
                          p =>
                            !(
                              bogoState.productFreeMapping[
                              bogoState.buyProducts[0]
                              ] || []
                            ).includes(p)
                        )}
                        selected={[]}
                        onChange={(v) => {
                          if (isView) return;

                          const bp = bogoState.buyProducts[0];
                          if (!bp) return;

                          const existing =
                            bogoState.productFreeMapping[bp] || [];

                          const merged = [...existing, ...v];

                          if (merged.length > bogoState.getQty) {
                            toast.error(
                              `You can select maximum ${bogoState.getQty} free product(s)`
                            );
                            return;
                          }

                          setBogoState(prev => ({
                            ...prev,
                            productFreeMapping: {
                              ...prev.productFreeMapping,
                              [bp]: merged,
                            },
                          }));
                        }}
                        controller={{
                          id: "bogoFree",
                          activeMultiSelect,
                          setActiveMultiSelect,
                        }}
                        placeholder="Search free products..."
                      />
                    )}
                    {/* ===== SELECTED FREE PRODUCTS (SAME AS BUY UI) ===== */}
                    {bogoState.freeMode === "different" &&
                      (bogoState.productFreeMapping[
                        bogoState.buyProducts[0]
                      ] || []).length > 0 && (
                        <div className="mt-4 border rounded-lg divide-y">
                          {bogoState.productFreeMapping[
                            bogoState.buyProducts[0]
                          ].map((label) => {
                            const p = findProductByLabel(label);
                            return (
                              <div key={label} className="flex justify-between p-3">
                                <div>
                                  <div className="text-sm font-medium">
                                    {p?.ItemName || label}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ₹{p?.Price}
                                  </div>
                                </div>

                                {!isView && (
                                  <button
                                    onClick={() => {
                                      const bp = bogoState.buyProducts[0];
                                      const updated =
                                        bogoState.productFreeMapping[bp].filter(
                                          x => x !== label
                                        );

                                      setBogoState(prev => ({
                                        ...prev,
                                        productFreeMapping: {
                                          ...prev.productFreeMapping,
                                          [bp]: updated,
                                        },
                                      }));
                                    }}
                                  >
                                    <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}


                  </div>
                </div>

                {/* ===== ADD RULE ===== */}
                <button
                  type="button"
                  disabled={isView}
                  onClick={addRuleToPreview}
                  className={`w-full py-3 rounded-lg font-medium transition
          ${isView
                      ? "bg-blue-400 opacity-50 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                >
                  Add This Rule to Offer
                </button>
                {/* ===== ADDED RULES (FIGMA STYLE) ===== */}
                {form?.bogoConfig?.rules?.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-4">

                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <h3 className="text-sm font-semibold text-green-800">
                        Added Rules ({form.bogoConfig.rules.length})
                      </h3>
                    </div>

                    {form.bogoConfig.rules.map((rule, index) => (
                      <div
                        key={index}
                        className="bg-white border border-green-200 rounded-lg p-4 relative"
                      >
                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">
                              Buy {rule.buyQty} – Get {rule.getQty} FREE
                            </span>
                          </div>

                          {!isView && (
                            <button
                              onClick={() => {
                                const updated = form.bogoConfig.rules.filter(
                                  (_, i) => i !== index
                                );
                                setForm({
                                  ...form,
                                  bogoConfig: {
                                    ...form.bogoConfig,
                                    rules: updated,
                                  },
                                });
                              }}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* BUY */}
                        <div className="border border-blue-200 bg-blue-50 rounded-md px-3 py-2 text-sm mb-2">
                          <strong>Buy:</strong> {rule.buyProducts.join(", ")}
                        </div>

                        {/* FREE */}
                        <div className="border border-green-200 bg-green-50 rounded-md px-3 py-2 text-sm">
                          <strong>Free:</strong>{" "}
                          {rule.freeMode === "same"
                            ? "Same Products"
                            : rule.freeProducts.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ===== OFFER SUMMARY ===== */}
                {/* ===== OFFER SUMMARY ===== */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Offers</span>
                    <span>{form?.bogoConfig?.rules?.length || 0}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Offer Type</span>
                    <span>
                      {(() => {
                        const rules = form?.bogoConfig?.rules || [];
                        const hasSame = rules.some(r => r.freeMode === "same");
                        const hasDifferent = rules.some(r => r.freeMode === "different");

                        if (hasSame && hasDifferent) return "Same & Different";
                        if (hasSame) return "Same";
                        if (hasDifferent) return "Different";
                        return "-";
                      })()}
                    </span>
                  </div>
                </div>
            <div className="flex items-center justify-end gap-3 w-full">
                  <button
                    type="button"
                    disabled={isView}
                      onClick={() => {
    console.log("BUTTON CLICKED");
    publishOffer();
  }}

                    className={`px-4 py-2 rounded-lg font-medium shadow-md transition cursor-pointer

              ${isView
                        ? "bg-emerald-400 opacity-50 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
                  >
                    Publish Offer
                  </button>

                  <button
                    onClick={() => setShowBogoModal(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10
                       p-1.5 rounded-lg transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>


              </div>
            </DialogContent>
          </Dialog>




        </DialogContent>
      </Dialog>
    </div>
  );
}
