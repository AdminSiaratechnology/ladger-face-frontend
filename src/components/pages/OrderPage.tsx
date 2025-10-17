import { Building, Check, CheckCircle2, LucideFileWarning } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import SelectedCompany from "../customComponents/SelectedCompany";
import { useCompanyStore } from "../../../store/companyStore";

export default function OrderPage() {
  const [selectedRoute, setSelectedRoute] = useState("");
  const { companies, defaultSelected } = useCompanyStore();
  const navigate = useNavigate();

  const company = companies.filter(
    (company) => company._id === defaultSelected
  );
  const allRoutes = [
    { id: 1, name: "Route 1" },
    { id: 2, name: "Route 2" },
    { id: 3, name: "Route 3" },
  ];

  const handleSubmit = () => {
    console.log("Submitting order for:", selectedRoute);
  };

  const areaSelected = !!selectedRoute;

  return (
    <>
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-3 py-2 -mx-6 rounded-t-lg p-4">
        <span className="p-2 text-xl">Start Creating Your Order</span>
      </div>

      {areaSelected && (
        <div className="border border-teal-600 mt-4 p-4 rounded-2xl">
          <span className="text-xl flex gap-1 font-bold items-center bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
            <Building className="w-5 h-5 text-teal-400" />
            Area Selected! now you can create orders
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-3">
            <div className="w-full">
              <SelectedCompany />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-semibold text-gray-700">
                Routes
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="h-11 w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all [&:invalid]:text-gray-400"
                required
              >
                <option value="" disabled hidden>
                  Select a Route
                </option>
                {allRoutes.map((route) => (
                  <option
                    key={route.id}
                    value={route.name}
                    className="text-gray-900"
                  >
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-semibold text-gray-700">
                Action
              </label>
              <Button
                onClick={() => {
                  navigate("/select-user", {
                    state: {
                      selectedRoute,
                      companyId: defaultSelected,
                    },
                  });
                }}
                className="h-11 w-full bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white transition-all cursor-pointer"
                disabled={!areaSelected}
              >
                + Create Order Now!
              </Button>
            </div>
          </div>
          <div className="border border-teal-400 p-4 rounded-2xl max-w-full mt-6 flex items-center bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent font-semibold">
            <CheckCircle2 className="w-4 h-4 text-teal-400 mr-1" /> Ready to
            create orders for {company[0].namePrint} in {selectedRoute}
          </div>
        </div>
      )}
      {!areaSelected && (
        <div className="border border-teal-600 mt-4 p-4 rounded-2xl">
          <span className="text-xl flex gap-1 font-bold items-center">
            <Building className="w-5 h-6 text-teal-400" />
            Area Selection
          </span>
          <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <LucideFileWarning className="w-4 h-4 text-yellow-600 font-bold" />
            <span className="text-orange-300 font-medium">
              Select Area to proceed with your order
            </span>
          </div>

          <span className="text-sm text-gray-600 mt-1"></span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-3">
            <div className="w-full">
              <SelectedCompany />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-semibold text-gray-700">
                Routes
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="h-11 w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
              >
                <option value="">Select a route</option>
                {allRoutes.map((route) => (
                  <option key={route.id} value={route.name}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-semibold text-gray-700">
                Action
              </label>
              <Button
                onClick={handleSubmit}
                className="h-11 w-full"
                disabled={!areaSelected}
              >
                + Select Route First
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
