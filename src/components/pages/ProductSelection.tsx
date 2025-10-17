import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useProductStore } from "../../../store/productStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";

const safeName = (value: any) => {
  if (!value) return "-";
  if (typeof value === "object") return value?.name || value?.symbol || "-";
  return value;
};

const ProductSelection = () => {
  const location = useLocation();
  const { selectedCustomer, selectedRoute, company } = location.state || {};

  const { fetchProducts, products, pagination } = useProductStore();
  const [cart, setCart] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 Fetch products on mount & when page changes
  useEffect(() => {
    fetchProducts(currentPage, pagination.limit || 10);
  }, [fetchProducts, currentPage]);

  // 🔹 Add product to cart
  const handleAddToCart = (product: any) => {
    const newCart = [...cart, { ...product, quantity: 1 }];
    setCart(newCart);
    setShowReview(true); // open drawer
  };

  // 🔹 Increase quantity
  const handleIncrease = (productId: string) => {
    setCart(
      cart.map((item) =>
        item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // 🔹 Decrease quantity
  const handleDecrease = (productId: string) => {
    const updated = cart
      .map((item) =>
        item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    setCart(updated);
    if (updated.length === 0) setShowReview(false);
  };

  // 🔹 Calculate total
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.minimumRate || 0) * item.quantity,
    0
  );
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
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
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
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="pb-24">
      {/* Header */}
      <div className=" border-gray-200 pb-2 flex items-center justify-between">
        <div className="text-xl text-gray-600">
          <span className="text-xl font-semibold text-teal-500">New Order</span>
          <h1 className="text-gray-500">
            {company?.namePrint} . {selectedRoute}
          </h1>
        </div>
        <div className="relative">
          <ShoppingCart className="w-7 h-7 text-teal-500" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-teal-900 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>
      </div>

      {/* Customer Info */}
      {/* <div className="text-sm text-gray-600 mb-4">
        <span className="font-medium">Customer:</span> {selectedUser?.name} (
        {selectedUser?.email})
      </div> */}

      {/* Main Layout: Products + Review Drawer */}
      <div className="flex relative transition-all duration-500 shadow-sm p-2 gap-8">
        {/* 🧩 Product Section */}
        <motion.div
          animate={{ width: showReview ? "calc(100% - 400px)" : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="transition-all pr-4"
        >
          {/* <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Select Products
          </h2> */}

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => {
              const inCart = cart.find((item) => item._id === product._id);
              const imageUrl =
                product.images && product.images.length > 0
                  ? product.images[0]?.fileUrl
                  : "https://via.placeholder.com/150?text=No+Image"; 

              return (
                <div
                  key={product._id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="object-contain h-full w-full"
                      loading="lazy"
                    />
                  </div>

                  {/* 📦 Product Details */}
                  <div className="p-2 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      Code: {product.code || "N/A"}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Unit: {safeName(product.unit)}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Stock Group: {safeName(product.stockGroup)}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Stock Category: {safeName(product.stockCategory)}
                    </p>

                    {product?.minimumRate !== undefined && (
                      <p className="text-teal-700 font-medium mt-2 text-sm">
                        ₹{Number(product.minimumRate).toLocaleString()}
                      </p>
                    )}

                    {/* Cart Controls */}
                    <div className="mt-auto pt-3">
                      {inCart ? (
                        <div className="flex items-center justify-between gap-3 py-2 bg-teal-50 border rounded-md">
                          <button
                            onClick={() => handleDecrease(product._id)}
                            className=" text-gray-800 font-bold px-3  rounded"
                          >
                            –
                          </button>
                          <span className="font-semibold text-gray-700">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrease(product._id)}
                            className=" text-gray-800 font-bold px-3 rounded"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-md font-medium transition-all cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {pagination.total > 0 && <PaginationControls />}
        </motion.div>

        {/* 🧾 Review Drawer (Right Side) */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              className="hidden sm:flex flex-col border-l border-gray-200 bg-white shadow-lg w-[350px] p-4 mt-1 h-[500px]"
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
                  className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white border border-gray-400 rounded-full cursor-pointer text-base hover:bg-teal-500 transition-all duration-150"
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
                    {/* <div className="text-xs">Quantity: {item.quantity}</div> */}
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                <button className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold shadow-sm">
                  Continue →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📱 Drawer for Mobile */}
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

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-gray-700 font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                <button className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-semibold shadow-sm">
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
