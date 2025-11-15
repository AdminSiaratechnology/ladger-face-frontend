import React, { useEffect, useState } from "react";
import { useCompanyStore } from "../../../store/companyStore";
import { useAuthStore } from "../../../store/authStore";
import api from "../../api/api";
import { SalesSummary } from "./sections/SalesSummary";
import { TopProductsSection } from "./sections/TopProductsSection";
import { SalesmanPersonalStats } from "./sections/SalesmanPersonalStats";
import { SalesmanTargetChart } from "./sections/SalesmanTargetChart";
import { CustomerMyOrders } from "./shared/CustomerMyOrders";
import HeaderGradient from "../customComponents/HeaderGradint";
import { RefreshCw, Activity } from "lucide-react";
import { Badge } from "../ui/badge";

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

const periodLabels: Record<TimePeriod, string> = {
day: 'Today', week: 'This Week', month: 'This Month', year: 'This Year'
};
export default function SalesmanDashboard() {
const { defaultSelected } = useCompanyStore();
const { user } = useAuthStore();
const companyId = defaultSelected?._id;
const userId = user?._id;

const [loading, setLoading] = useState(true);
const [period, setPeriod] = useState<TimePeriod>('month');
const [personalData, setPersonalData] = useState<any>({});
const [orders, setOrders] = useState<any[]>([]);

const fetchCoreData = async () => {
if (!companyId || !userId) return;
try {
setLoading(true);
const [statsRes, ordersRes] = await Promise.all([
api.getSalesmanPersonalStats({ companyId, period }),
api.getOrdersByUser(companyId),
]);
setPersonalData(statsRes.data || {});
setOrders(ordersRes.orders || []);
} catch (error) {
console.error("Error:", error);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchCoreData();
}, [companyId, userId, period]);

if (loading) {
return (
<div className="flex items-center justify-center min-h-screen">
<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
</div>
);
}

return (
<div className="space-y-6 p-4 md:p-6">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
<HeaderGradient title="Salesman Dashboard" subtitle="Track your performance and orders." />
<div className="flex items-center space-x-2">
<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
<Activity className="w-3 h-3 mr-1" /> Live
</Badge>
<button
onClick={fetchCoreData}
className="flex items-center space-x-2 px-3 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600"
>
<RefreshCw className="w-4 h-4" />
<span className="hidden sm:inline">Refresh</span>
</button>
</div>
</div>

<SalesSummary
todaySales={personalData.todaySales || 0}
lastMonthSales={personalData.lastMonthSales || 0}
totalSales={personalData.totalSales || 0}
todayChange={personalData.todayChange}
lastMonthChange={personalData.lastMonthChange}
totalChange="+ Lifetime"
/>

<TopProductsSection
companyId={companyId}
period={period}
onPeriodChange={setPeriod}
title="My Top Products"
/>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<SalesmanPersonalStats personalData={personalData} periodLabel={periodLabels[period]} />
<SalesmanTargetChart
target={personalData.target || 5000000}
achieved={personalData.totalSales || 0}
period={periodLabels[period]}
/>
<CustomerMyOrders orders={orders} />
</div>
</div>
);
}