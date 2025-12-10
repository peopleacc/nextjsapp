import { supabase } from "@/lib/supabaseClient";
import {
  RevenueTrendChart,
  StatusDonutChart,
} from "@/app/components/report/charts";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

function buildMonthlyTrend(orders = []) {
  const buckets = new Map();

  orders.forEach((order) => {
    if (!order?.create_at) return;
    const date = new Date(order.create_at);
    const bucketKey = `${date.getFullYear()}-${date.getMonth()}`;
    const previous = buckets.get(bucketKey) || {
      date,
      total: 0,
      label: `${monthFormatter.format(date)} ${date.getFullYear()}`,
    };

    previous.total += Number(order?.total_estimasi_harga) || 0;
    buckets.set(bucketKey, previous);
  });

  const sorted = [...buckets.values()].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const lastSix = sorted.slice(-6);

  return {
    categories: lastSix.map((item) => item.label),
    data: lastSix.map((item) => item.total),
  };
}

function buildStatusBreakdown(orders = []) {
  const statusMap = orders.reduce((acc, order) => {
    const label = order?.status_pengerjaan?.trim() || "Unknown";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(statusMap);
  const data = labels.map((label) => statusMap[label]);

  return { labels, data };
}

export default async function ReportPage() {
  const { data: orders, error } = await supabase
    .from("t_pemesanan")
    .select("pesanan_id,status_pengerjaan,total_estimasi_harga,create_at")
    .order("create_at", { ascending: true });

  if (error) {
    return (
      <div className="glass-panel p-6 text-red-600">
        Failed to load report: {error.message}
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.total_estimasi_harga) || 0),
    0
  );
  const completedOrders = orders.filter(
    (order) => order?.status_pengerjaan?.toLowerCase() === "selesai"
  ).length;
  const completionRate = totalOrders
    ? Math.round((completedOrders / totalOrders) * 100)
    : 0;
  const avgTicket = totalOrders ? totalRevenue / totalOrders : 0;

  const monthlyTrend = buildMonthlyTrend(orders);
  const statusBreakdown = buildStatusBreakdown(orders);

  const recentOrders = [...orders]
    .sort(
      (a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 14rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Report & Analytics</h2>
          <p className="text-sm text-gray-600">View detailed business reports</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto p-4" style={{ height: 'calc(100% - 80px)' }}>
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryCard label="Total Revenue" value={currency.format(totalRevenue)} />
            <SummaryCard label="Total Order" value={totalOrders} />
            <SummaryCard label="Completion Rate" value={`${completionRate}%`} />
            <SummaryCard label="Average Ticket" value={currency.format(avgTicket)} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="glass-panel p-6 xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#2D336B]/60">
                    Trend
                  </p>
                  <h2 className="text-2xl font-semibold text-[#2D336B]">
                    Revenue Last 6 Months
                  </h2>
                </div>
              </div>
              {monthlyTrend.data.length ? (
                <RevenueTrendChart {...monthlyTrend} />
              ) : (
                <EmptyState message="No revenue data yet" />
              )}
            </div>

            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#2D336B]/60">
                    Status
                  </p>
                  <h2 className="text-2xl font-semibold text-[#2D336B]">
                    Order Distribution
                  </h2>
                </div>
              </div>
              {statusBreakdown.data.length ? (
                <StatusDonutChart {...statusBreakdown} />
              ) : (
                <EmptyState message="No orders recorded yet" />
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#2D336B]/60">
                  Activity
                </p>
                <h2 className="text-2xl font-semibold text-[#2D336B]">
                  Recent Orders
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2D336B]/10">
                <thead>
                  <tr>
                    {["ID", "Date", "Status", "Total"].map((head) => (
                      <th
                        key={head}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#2D336B]/70"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D336B]/10">
                  {recentOrders.length ? (
                    recentOrders.map((order) => (
                      <tr key={order.pesanan_id}>
                        <td className="px-4 py-3 font-semibold text-[#2D336B]">
                          #{order.pesanan_id}
                        </td>
                        <td className="px-4 py-3 text-[#2D336B]/80">
                          {order.create_at
                            ? new Date(order.create_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="accent-chip bg-[#FFF2F2] text-[#2D336B]">
                            {order.status_pengerjaan || "Unknown"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#2D336B]">
                          {currency.format(Number(order.total_estimasi_harga) || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-[#2D336B]/60"
                        colSpan={4}
                      >
                        No recent orders.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="glass-panel p-5 flex flex-col gap-2">
      <p className="text-xs uppercase tracking-[0.3em] text-[#2D336B]/60">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[#2D336B]">{value}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-[#2D336B]/60">
      <i className="bi bi-activity text-4xl mb-3"></i>
      {message}
    </div>
  );
}

