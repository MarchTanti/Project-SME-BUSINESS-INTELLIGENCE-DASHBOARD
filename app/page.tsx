import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import SalesChart from "@/components/SalesChart";

const baht = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency", currency: "THB", maximumFractionDigits: 0,
  }).format(n);

const statusLabel: Record<string, string> = {
  paid: "ชำระแล้ว",
  pending: "รอชำระ",
  cancelled: "ยกเลิก",
};

type TopProduct = { id: string; name: string; units_sold: number; revenue: number };
type RecentOrder = {
  id: string; order_no: string; customer_name: string;
  status: string; ordered_at: string; total_amount: number;
};

async function DashboardContent() {
  const [kpi, daily, top, recent] = await Promise.all([
    supabase.from("v_dashboard_summary").select("*").single(),
    supabase.from("v_sales_daily").select("day, revenue")
      .order("day", { ascending: false }).limit(30),
    supabase.from("v_top_products").select("*"),
    supabase.from("v_recent_orders").select("*"),
  ]);

  console.log("errors:", kpi.error, daily.error, top.error, recent.error);

  const k = kpi.data;
  const cards = [
    { label: "Total Revenue", emoji: "💰", variant: "f7-card--gold",
      value: baht(Number(k?.total_revenue ?? 0)) },
    { label: "Total Orders", emoji: "🧾", variant: "",
      value: Number(k?.total_orders ?? 0).toLocaleString() },
    { label: "Total Customers", emoji: "👥", variant: "f7-card--sky",
      value: Number(k?.total_customers ?? 0).toLocaleString() },
  ];

  const chartData = [...(daily.data ?? [])]
    .reverse()
    .map((d) => ({ day: d.day as string, revenue: Number(d.revenue) }));

  const topList = (top.data ?? []) as TopProduct[];
  const maxUnits = Math.max(1, ...topList.map((p) => Number(p.units_sold)));
  const medal = ["🥇", "🥈", "🥉"];

  return (
    <>
      {/* KPI */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className={`f7-card ${c.variant} p-5`}>
            <p className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--teal-dark)" }}>
              <span className="f7-emoji">{c.emoji}</span> {c.label}
            </p>
            <p className="text-3xl font-extrabold mt-2">{c.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Analytics */}
        <section className="f7-card p-5 lg:col-span-2">
          <h2 className="f7-title"><span className="f7-emoji">📈</span> Sales Analytics</h2>
          <p className="text-xs mb-3" style={{ color: "var(--teal-dark)" }}>
            ยอดขายรายวัน 30 วันล่าสุด (เฉพาะออเดอร์ที่ชำระแล้ว)
          </p>
          {chartData.length ? (
            <SalesChart data={chartData} />
          ) : (
            <p className="text-sm opacity-60">ไม่มีข้อมูล</p>
          )}
        </section>

        {/* Top Products */}
        <section className="f7-card p-5">
          <h2 className="f7-title"><span className="f7-emoji">🏆</span> Top 5 Products</h2>
          <ol className="space-y-4">
            {topList.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <div className={`f7-rank ${i < 3 ? `f7-rank--${i + 1}` : ""}`}>
                  {i < 3 ? medal[i] : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 text-sm font-bold">
                    <span className="truncate">
                      {i === 0 && <span className="f7-crown mr-1">👑</span>}
                      {p.name}
                    </span>
                    <span style={{ color: i === 2 ? "var(--coral)" : "var(--teal-dark)" }}>
                      {Number(p.units_sold).toLocaleString()} ชิ้น
                    </span>
                  </div>
                  <div className="f7-bar mt-1.5">
                    <span style={{ width: `${(Number(p.units_sold) / maxUnits) * 100}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Recent Orders */}
      <section className="f7-card p-5 mt-6">
        <h2 className="f7-title"><span className="f7-emoji">🛒</span> Recent Orders</h2>
        <ul className="space-y-3">
          {((recent.data ?? []) as RecentOrder[]).map((o) => (
            <li
              key={o.id}
              className={`f7-card f7-card--${o.status} px-4 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1`}
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            >
              <div className="min-w-0">
                <p className="font-extrabold text-sm">{o.order_no}</p>
                <p className="text-sm opacity-80 truncate">{o.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold">{baht(Number(o.total_amount))}</p>
                <p className="text-xs opacity-60">
                  {new Date(o.ordered_at).toLocaleString("th-TH", {
                    dateStyle: "short", timeStyle: "short",
                  })}
                </p>
              </div>
              <span className={`f7-pill f7-pill--${o.status}`}>
                {statusLabel[o.status] ?? o.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function Dashboard() {
  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto">
      <header className="text-center mb-8 mt-2">
        <div className="f7-ribbon">
          SME <span className="f7-seven">7</span> DASHBOARD
        </div>
      </header>
      <Suspense
        fallback={
          <p className="text-center font-bold animate-pulse" style={{ color: "var(--teal-dark)" }}>
            กำลังโหลดข้อมูล...
          </p>
        }
      >
        <DashboardContent />
      </Suspense>
    </main>
  );
}