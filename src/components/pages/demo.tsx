 <Dialog open={showBogoModal} onOpenChange={(open) => {
  setShowBogoModal(open);
}}>
  <DialogContent
    className="custom-dialog-container max-w-5xl !transition-none !transform-none !duration-0 !ease-none !animate-none"
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

      <Card className="rounded-xl shadow-sm border">
        <CardContent className="p-6">
          {/* QUANTITY CONFIGURATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left: Templates and Quantity Inputs */}
            <div className="p-4 border rounded-lg bg-white">
              <p className="text-lg font-semibold mb-3 text-gray-800">Configure Buy & Get Quantities</p>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Quick Templates</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ buy: 1, get: 1 }, { buy: 2, get: 1 }, { buy: 3, get: 1 }, { buy: 1, get: 2 }].map(
                    (tpl, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          if (isView) return;
                          applyTemplate(tpl.buy, tpl.get);
                        }}
                        className={`p-3 border rounded-lg cursor-pointer transition text-center ${
                          bogoState.buyQty === tpl.buy && bogoState.getQty === tpl.get
                            ? "bg-blue-50 border-blue-300"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-medium">Buy {tpl.buy}</div>
                        <div className="text-sm text-gray-600">Get {tpl.get} Free</div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-2">OR CREATE CUSTOM</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Buy Quantity</label>
                  <input
                    type="number"
                    min={1}
                    disabled={isView}
                    readOnly={isView}
                    value={bogoState.buyQty}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setBogo("buyQty", val);
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Get Free Quantity</label>
                  <input
                    type="number"
                    min={1}
                    disabled={isView}
                    readOnly={isView}
                    value={bogoState.getQty}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setBogo("getQty", val);
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Right: Preview and Mode Selection */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="p-4 border rounded-lg bg-white">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5">
                  <div className="text-center">
                    <div className="text-xl font-bold">Buy {bogoState.buyQty} Get {bogoState.getQty} FREE</div>
                    <div className="text-sm opacity-90 mt-1">
                      {bogoState.freeMode === "same"
                        ? "Same product will be FREE"
                        : "Selected products will be FREE"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Mode Selection */}
              <div className="p-4 border rounded-lg bg-white">
                <p className="text-sm font-medium text-gray-700 mb-2">Choose Free Product Type</p>
                <div className="space-y-2">
                  <div
                    onClick={() => {
                      if (isView) return;
                      setBogo("freeMode", "same");
                      // Clear all free mappings when switching to same mode
                      setBogoState(prev => ({
                        ...prev,
                        productFreeMapping: {}
                      }));
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition ${bogoState.freeMode === "same"
                      ? "bg-green-50 border-green-400 shadow-sm"
                      : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="font-medium text-gray-800">Same Product</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Customer gets the same product for free
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      if (isView) return;
                      setBogo("freeMode", "different");
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition ${bogoState.freeMode === "different"
                      ? "bg-green-50 border-green-400 shadow-sm"
                      : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="font-medium text-gray-800">Different Products</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Select different free products for each buy product
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT CONFIGURATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Products to Buy Selection */}
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-semibold text-gray-800">1. Select Products to Buy</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Select {bogoState.buyQty} or more
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Customer must buy {bogoState.buyQty} product(s) from this list
              </p>
              
              {/* Filter out already selected products from the options */}
              <MultiSelect
                label="Add Products to Buy"
                options={productOptions.filter(option => !bogoState.buyProducts.includes(option))}
                selected={[]} // Empty because we're showing selected products in table
                onChange={(v) => {
                  // If "Buy One Get One" - only allow selecting 1 product
                  if (bogoState.buyQty === 1 && bogoState.getQty === 1) {
                    // Only add if no product is selected yet
                    if (bogoState.buyProducts.length === 0 && v.length > 0) {
                      const newProduct = v[0];
                      setBogo("buyProducts", [newProduct]);
                      
                      // Initialize free mapping for new product
                      setBogoState(prev => ({
                        ...prev,
                        productFreeMapping: {
                          ...prev.productFreeMapping,
                          [newProduct]: []
                        }
                      }));
                    }
                  } else {
                    // For other quantities, allow multiple selections
                    const newProducts = [...bogoState.buyProducts, ...v];
                    setBogo("buyProducts", newProducts);
                    
                    // Initialize free mapping for new products
                    const newMapping = { ...bogoState.productFreeMapping };
                    v.forEach(product => {
                      if (!newMapping[product]) {
                        newMapping[product] = [];
                      }
                    });
                    
                    setBogoState(prev => ({
                      ...prev,
                      productFreeMapping: newMapping
                    }));
                  }
                }}
                disabled={isView}
                controller={{
                  id: "bogoBuy",
                  activeMultiSelect,
                  setActiveMultiSelect,
                }}
              />
              
              {bogoState.buyProducts.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{bogoState.buyProducts.length} product(s)</strong> selected for purchase
                  </p>
                </div>
              )}
            </div>

            {/* Free Products Section */}
            <div className="p-4 border rounded-lg bg-white">
              <p className="text-lg font-semibold mb-3 text-gray-800">2. Free Products</p>
              <p className="text-sm text-gray-600 mb-3">
                Customer gets {bogoState.getQty} FREE item(s)
              </p>
              
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Current Mode:</strong> {bogoState.freeMode === "same" ? "Same Product" : "Different Products"}
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                {bogoState.freeMode === "same" ? (
                  <p>Customer will receive the same product for free when buying {bogoState.buyQty} of it.</p>
                ) : (
                  <p>For each buy product, select the free product(s) that will be given away.</p>
                )}
              </div>
            </div>
          </div>

          {/* BOGO OFFER CONFIGURATION TABLE */}
          {bogoState.buyProducts.length > 0 && (
            <div className="mt-6 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">BOGO Offer Configuration</h3>
                    <p className="text-sm text-gray-600">
                      Buy {bogoState.buyQty} → Get {bogoState.getQty} Free
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {bogoState.buyProducts.length} product(s) in offer
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Products to Buy
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Free Products
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-16">
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bogoState.buyProducts.map((buyProductLabel, index) => {
                      const buyProduct = findProductByLabel(buyProductLabel);
                      return (
                        <tr key={buyProductLabel} className="hover:bg-gray-50">
                          {/* BUY PRODUCT COLUMN */}
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden mr-3">
                                {buyProduct?.productId?.images?.[0] ? (
                                  <img
                                    src={buyProduct.productId.images[0]}
                                    alt={buyProduct?.ItemName || buyProduct?.name || buyProductLabel}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="text-xs text-gray-400">
                                    {buyProduct?.ItemName ? buyProduct.ItemName[0] : "P"}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {buyProduct?.ItemName || buyProduct?.name || buyProductLabel}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {buyProduct?.ItemCode ? `Code: ${buyProduct.ItemCode}` : ""}
                                </div>
                                <div className="text-sm text-gray-900 font-medium">
                                  {buyProduct?.Price ? `₹${buyProduct.Price}` : buyProduct?.MRP ? `₹${buyProduct.MRP}` : ""}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* FREE PRODUCT COLUMN */}
                          <td className="px-4 py-4">
                            {bogoState.freeMode === "same" ? (
                              <div className="flex items-center h-full">
                                <div className="text-sm text-gray-700">
                                  <div className="font-medium">Same Product</div>
                                  <div className="text-xs text-gray-500">Buy {bogoState.buyQty}, get {bogoState.getQty} free</div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-500 mb-1">
                                  Select {bogoState.getQty} free product(s):
                                </div>
                                
                                {/* Filter out already selected free products for this row AND other rows */}
                                <MultiSelect
                                  label=""
                                  options={productOptions.filter(option => {
                                    // Don't include products already selected as free for this row
                                    const currentFreeProducts = bogoState.productFreeMapping?.[buyProductLabel] || [];
                                    if (currentFreeProducts.includes(option)) {
                                      return true; // Keep it in options so it shows as selected
                                    }
                                    
                                    // Check if this product is already selected as free in ANY row
                                    const isAlreadyFreeInOtherRows = Object.entries(bogoState.productFreeMapping || {})
                                      .filter(([key]) => key !== buyProductLabel) // Exclude current row
                                      .some(([_, freeProducts]) => freeProducts.includes(option));
                                    
                                    return !isAlreadyFreeInOtherRows;
                                  })}
                                  selected={bogoState.productFreeMapping?.[buyProductLabel] || []}
                                  onChange={(v) => {
                                    // Enforce maximum selection of getQty
                                    if (v.length > bogoState.getQty) {
                                      toast.error(`You can only select up to ${bogoState.getQty} free product(s)`);
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
                                    id: `bogoFree-${buyProductLabel}`,
                                    activeMultiSelect,
                                    setActiveMultiSelect,
                                  }}
                                />
                                
                                {/* Selected free products preview */}
                                {bogoState.productFreeMapping?.[buyProductLabel]?.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {bogoState.productFreeMapping[buyProductLabel].map(freeLabel => {
                                      const freeProduct = findProductByLabel(freeLabel);
                                      return (
                                        <div key={freeLabel} className="flex items-center justify-between text-xs bg-green-50 p-2 rounded border border-green-100">
                                          <span className="text-green-800">
                                            {freeProduct?.ItemName || freeProduct?.name || freeLabel}
                                          </span>
                                          <span className="text-green-600 font-medium">
                                            {freeProduct?.Price ? `₹${freeProduct.Price}` : freeProduct?.MRP ? `₹${freeProduct.MRP}` : ""}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* REMOVE COLUMN WITH CROSS ICON */}
                          <td className="px-4 py-4">
                            {!isView && (
                              <button
                                type="button"
                                onClick={() => removeBuyProduct(buyProductLabel)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Remove product"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-5 w-5" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUMMARY AND BUTTONS */}
          <div className="mt-6">
            {bogoState.buyProducts.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Offer Summary:</strong> Customer must buy <strong>{bogoState.buyQty}</strong> product(s) 
                  from the selected products to get <strong>{bogoState.getQty}</strong> free product(s) 
                  {bogoState.freeMode === "same" ? " (same product)" : " (selected free products)"}.
                </p>
                {bogoState.buyQty === 1 && bogoState.getQty === 1 && bogoState.buyProducts.length > 1 && (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ For "Buy 1 Get 1" offer, typically only 1 product should be selected. Consider using "Buy 2 Get 1" or other templates for multiple products.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
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
        </CardContent>
      </Card>
    </div>
  </DialogContent>
</Dialog>