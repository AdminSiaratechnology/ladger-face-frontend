import React from "react";
import { useAuthStore } from "../../../store/authStore";
import AdminDashboard from "../dashboards/AdminDashboard";
import SalesmanDashboard from "../dashboards/SalesmanDashboard";
import CustomerDashboard from "../dashboards/CustomerDashboard";

export default function Dashboard() {
  const { user } = useAuthStore();
  const role = user?.role as "Admin" | "Salesman" | "Customer" | undefined;

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (role === "Admin" || role==="Client") return <AdminDashboard />;
  if (role === "Salesman") return <SalesmanDashboard />;
  if (role === "Customer") return <CustomerDashboard />;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-red-600">Access denied.</p>
    </div>
  );
}
