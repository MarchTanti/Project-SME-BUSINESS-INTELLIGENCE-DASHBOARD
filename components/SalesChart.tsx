"use client";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function SalesChart({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <div className="h-64 sm:h-80 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2BA8A2" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2BA8A2" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#BFE5E2" vertical={false} />
          <XAxis dataKey="day" tickFormatter={(d) => d.slice(5)} fontSize={12}
                 stroke="#1E8C86" tickLine={false} />
          <YAxis fontSize={12} stroke="#1E8C86" tickLine={false} axisLine={false}
                 tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip
            formatter={(v) => [`฿${Number(v).toLocaleString()}`, "ยอดขาย"]}
            contentStyle={{
              background: "#FFF8E7", border: "2px solid #17504D",
              borderRadius: 12, fontWeight: 700,
            }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#2BA8A2" strokeWidth={3}
                fill="url(#tealFill)"
                activeDot={{ r: 6, fill: "#FFD23F", stroke: "#17504D", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}