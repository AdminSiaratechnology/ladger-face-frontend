import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStockItemStore } from "../../../store/stockItemStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { useCompanyStore } from "../../../store/companyStore";
import api from "../../../src/api/api";
import { toast } from "sonner";
const safeName = (value: any) => {
  if (!value) return "-";
  if (typeof value === "object") return value?.name || value?.symbol || "-";
  return value;
};

// ✅ Product Card Component
const ProductCard = ({
  product,
  images,
  inCart,
  onAddToCart,
  onIncrease,
  onDecrease,
}: any) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      {/* Image Carousel */}
      <div className="h-32 bg-gray-100 relative group">
        <img
          src={images[currentImageIndex]}
          alt={`${product.name} - Image ${currentImageIndex + 1}`}
          className="object-cover h-full w-full"
          loading="lazy"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Details */}
      <div className="p-2 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-800 text-sm truncate">
          {product.name}
        </h3>
        <p className="text-gray-500 text-xs">Code: {product.code || "N/A"}</p>
        {/* <p className="text-gray-600 text-xs">Unit: {safeName(product.unit)}</p> */}
        <p className="text-gray-600 text-xs">
          Stock Group: {safeName(product.stockGroup)}
        </p>
        <p className="text-gray-600 text-xs">
          Stock Category: {safeName(product.stockCategory)}
        </p>

        {product.minimumRate !== undefined && (
          <p className="text-teal-700 font-medium mt-2 text-sm">
            ₹{Number(product.minimumRate).toLocaleString()}
          </p>
        )}

        {/* Add / Increase Buttons */}
        <div className="mt-auto pt-3">
          {inCart ? (
            <div className="flex items-center justify-between gap-3 py-2 bg-teal-50 border rounded-md">
              <button
                onClick={() => onDecrease(product._id)}
                className=" text-gray-800 font-bold px-3 rounded"
              >
                –
              </button>
              <span className="font-semibold text-gray-700">
                {inCart.quantity}
              </span>
              <button
                onClick={() => onIncrease(product._id)}
                className=" text-gray-800 font-bold px-3 rounded"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-md font-medium transition-all cursor-pointer"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductSelection = () => {
  const location = useLocation();
  const { selectedCustomer, selectedRoute, company } = location.state || {};
  const { defaultSelected } = useCompanyStore();

  // ✅ Use stockItemStore instead of productStore
  const { fetchStockItems, filterStockItems, stockItems, pagination } =
    useStockItemStore();

  const [cart, setCart] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    fetchStockItems(currentPage, pagination.limit || 10, defaultSelected?._id);
  }, [fetchStockItems, currentPage, pagination.limit, defaultSelected]);

  useEffect(() => {
    if (defaultSelected && company && defaultSelected._id !== company._id) {
      navigate(-1);
    }
  }, [defaultSelected]);

  // ✅ Search & Filter
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        filterStockItems(
          searchTerm,
          "",
          "nameAsc",
          defaultSelected?._id, // ✅ Option A order
          currentPage,
          10
        );
      } else {
        fetchStockItems(currentPage, 10, defaultSelected?._id);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage, defaultSelected]);
  useEffect(() => {
    const loadCart = async () => {
      if (!defaultSelected?._id) return;

      try {
        const serverCart = await api.fetchCart({
          companyId: defaultSelected._id,
        });

        const normalized = serverCart.cart.map((c: any) => ({
          _id: c.product._id,
          name: c.product.ItemName,
          code: c.product.ItemCode,
          stockGroup: c.product.Group,
          stockCategory: c.product.Category,
          minimumRate: c.product.Price,
          quantity: c.quantity,
          images: c.product.productId?.images ?? [],
        }));

        setCart(normalized);
        if (normalized.length > 0) setShowReview(true);
      } catch (err) {
        console.error("Failed to load cart", err);
      }
    };

    loadCart();
  }, [defaultSelected?._id]);

  // ✅ Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // ✅ Add to Cart
  const handleAddToCart = async (product: any) => {
    const newItem = {
      productId: product._id,
      quantity: 1,
    };

    // Update local cart instantly
    setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    setShowReview(true);

    try {
      await api.addCart(newItem, defaultSelected?._id);
    } catch (err) {
      console.error("Failed to sync cart with server", err);
    }
  };

  // ✅ Increase Quantity
  const handleIncrease = async (productId: string) => {
    const updatedCart = cart.map((item) =>
      item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );

    setCart(updatedCart);

    const product = updatedCart.find((i) => i._id === productId);
    if (!product) return;

    try {
      await api.addCart(
        {
          productId,
          quantity: product.quantity,
        },
        defaultSelected?._id
      );
    } catch (err) {
      console.error("Failed to sync increase", err);
    }
  };

  // ✅ Decrease Quantity
  const handleDecrease = async (productId: string) => {
    const updated = cart
      .map((item) =>
        item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);

    setCart(updated);

    // Hide drawer if nothing left
    if (updated.length === 0) setShowReview(false);

    const product = updated.find((i) => i._id === productId);

    try {
      await api.addCart(
        {
          productId,
          quantity: product ? product.quantity : 0, // if removed
        },
        defaultSelected?._id
      );
    } catch (err) {
      console.error("Failed to sync decrease", err);
    }
  };

  // ✅ Total Amount
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.minimumRate || 0) * item.quantity,
    0
  );

  // ✅ Navigate to checkout
  const handleContinue = () => {
    navigate("/checkout", {
      state: { cart, selectedCustomer, selectedRoute, company, totalAmount },
    });
  };

  // ✅ Pagination Component
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm border">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * (pagination.limit || 10) + 1} -{" "}
        {Math.min(currentPage * (pagination.limit || 10), pagination.total)} of{" "}
        {pagination.total} products
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {pagination.totalPages || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(pagination.totalPages || 1, prev + 1)
            )
          }
          disabled={currentPage === pagination.totalPages}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // ✅ Normalize StockItems → Product format
  const normalizedItems = stockItems?.map((item: any) => ({
    _id: item._id,
    name: item.ItemName,
    code: item.ItemCode,
    stockGroup: item.Group,
    stockCategory: item.Category,
    minimumRate: item.Price,

    images: item.productId?.images?.map((img: any) => img.fileUrl) ?? [], // ✅ fallback
  }));
  const handleClearCart = async () => {
    try {
      setCart([]);
      setShowReview(false);

      await api.clearCart(defaultSelected?._id);

      toast.success("Cart cleared");
    } catch (err) {
      toast.error("Failed to clear cart");
      console.error(err);
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="border-gray-200 pb-2 flex items-center justify-between">
        <div className="text-xl text-gray-600">
          <span className="text-xl font-semibold text-teal-500">New Order</span>
          <h1 className="text-teal-900 font-bold">
            {selectedCustomer?.customerName}
            {selectedRoute && ` • ${selectedRoute}`}
          </h1>
        </div>

        <div className="relative" onClick={() => setShowReview(true)}>
          <ShoppingCart className="w-7 h-7 text-teal-500 cursor-pointer" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-teal-900 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex w-full mb-4 mt-2">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Main Layout */}
      <div className="flex relative transition-all duration-500 shadow-sm p-2 gap-8">
        {/* Product Section */}
        <motion.div
          animate={{ width: showReview ? "calc(100% - 400px)" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="transition-all pr-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {normalizedItems.map((product) => {
              const inCart = cart.find((item) => item._id === product._id);

              // fallback demo images
              const finalImages =
                product.images.length > 0
                  ? product.images
                  : [
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
                      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop",
                    ];

              return (
                <ProductCard
                  key={product._id}
                  product={product}
                  images={finalImages}
                  inCart={inCart}
                  onAddToCart={handleAddToCart}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                />
              );
            })}
          </div>

          {pagination.total > 0 && <PaginationControls />}
        </motion.div>

        {/* ✅ Review Drawer for Desktop */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              className="hidden sm:flex flex-col border-l border-gray-200 bg-white shadow-lg w-[350px] p-4 mt-1 h-[500px]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="relative border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Review Order
                </h2>

                <button
                  onClick={() => setShowReview(false)}
                  className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-white border border-gray-300 rounded-full text-[10px] leading-none hover:bg-teal-500 transition-all duration-150 shadow-sm"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-3 space-y-2">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-md p-3 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium text-sm text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        ₹{item.minimumRate?.toFixed(2)} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrease(item._id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 rounded"
                      >
                        –
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleIncrease(item._id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

             <div className="flex justify-end mt-3">
  <button
    onClick={handleClearCart}
    className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 
              rounded-lg text-sm font-medium transition-all shadow-sm cursor-pointer"
  >
    Clear Cart
  </button>
</div>


              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                <button
                  className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold shadow-sm"
                  onClick={handleContinue}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Mobile Drawer */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              className="sm:hidden fixed top-0 right-0 h-full w-full bg-white shadow-2xl p-4 flex flex-col border-l border-gray-200 z-30"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Review Order
                </h2>
                <button
                  onClick={() => setShowReview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-3 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-md p-3 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        ₹{item.minimumRate?.toFixed(2)} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrease(item._id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 rounded"
                      >
                        –
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleIncrease(item._id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-3">
                <button
                  onClick={handleClearCart}
                  className="text-red-600 text-sm hover:underline"
                >
                  Clear Cart
                </button>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                <button
                  className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold shadow-sm cursor-pointer"
                  onClick={handleContinue}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductSelection;
