import { DashboardStats } from "@/presentation/components/Dashboard/DashboardStats";
import { QuickActions } from "@/presentation/components/Dashboard/QuickActions";
import { RecentInvoices } from "@/presentation/components/Dashboard/RecentInvoices";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Dashboard</h1>
        <p className="text-gray-600">Gestiona tus facturas de manera eficiente</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentInvoices />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
