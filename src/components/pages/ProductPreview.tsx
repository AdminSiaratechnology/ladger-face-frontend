import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop";

const ProductPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { product, company, selectedCustomer, selectedRoute } = state || {};

  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  // Load batches for batch products
  useEffect(() => {
    if (!product?.batch) return;

    const loadBatches = async () => {
      try {
        setLoading(true);
        const res = await api.fetchBatches(product._id, company._id);
        const list = res?.data || [];
        setBatches(list);
        setSelectedBatch(list[0] || null);
      } catch (err) {
        console.error("Failed to fetch batches", err);
      } finally {
        setLoading(false);
      }
    };

    loadBatches();
  }, [product, company]);

  const handleAddToCart = async () => {
    if (product.batch && !selectedBatch) {
      alert("Please select batch");
      return;
    }

    const payload = {
      items: [
        {
          productId: product._id,
          quantity: qty,
          batch: product.batch
            ? {
                stockItemId: selectedBatch._id.split("_")[0],
                batchName: selectedBatch.batchName,
                godownName: selectedBatch.godownName,
              }
            : undefined,
        },
      ],
    };

    try {
      await api.addCart(payload, company._id);
      navigate(-1);
    } catch (err) {
      console.error("Failed to add cart", err);
    }
  };

  if (!product) return <div className="p-4">Product not found</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between mb-6 items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800 transition"
        >
          ← Back
        </button>
        <button
          onClick={handleAddToCart}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Add to Cart
        </button>
      </div>

      <div className="bg-white shadow-md rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center items-center">
          <img
            src={product?.images?.[0] || FALLBACK_IMAGE}
            alt={product.name}
            className="w-72 h-72 object-contain border rounded-lg shadow-sm hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-xl text-teal-600 font-bold mb-4">
            ₹ {product.minimumRate?.toLocaleString()}
          </p>

          {product.batch && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Select Batch</h3>

              {loading && (
                <p className="text-sm text-gray-500">Loading batches...</p>
              )}

              <div className="space-y-3">
                {batches.map((b) => (
                  <div
                    key={b._id}
                    onClick={() => setSelectedBatch(b)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200
                      ${
                        selectedBatch?._id === b._id
                          ? "border-teal-500 bg-teal-50 shadow-md"
                          : "hover:border-gray-400 hover:shadow-sm"
                      }`}
                  >
                    <p className="font-semibold text-gray-800">
                      Batch: {b.batchName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {b.godownName} • Stock: {b.availableQty}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-6">
            <span className="font-medium">Qty</span>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="px-6 py-2 text-center">{qty}</span>
              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
