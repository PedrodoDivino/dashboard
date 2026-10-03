"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFormatter, useTranslations } from "next-intl";
import type { SeriesPoint } from "@/lib/mock/dashboard";

export function RequestsChart({ data }: { data: SeriesPoint[] }) {
  const format = useFormatter();
  const t = useTranslations("home.chart");

  const day = (iso: string) => format.dateTime(new Date(`${iso}T12:00:00Z`), { day: "2-digit", month: "short" });
  const compact = (n: number) => format.number(n, { notation: "compact", maximumFractionDigits: 1 });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="nx-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6400" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#FF6400" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={day}
            tick={{ fill: "#71717a", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            tickFormatter={compact}
            tick={{ fill: "#71717a", fontSize: 11, fontFamily: "var(--font-jetbrains-mono)" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,165,0,0.4)", strokeDasharray: "3 3" }}
            contentStyle={{
              background: "#0B0B0B",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            itemStyle={{ color: "#ffedd5" }}
            labelFormatter={(label) => day(String(label))}
            formatter={(value) => [format.number(Number(value)), t("series")]}
          />
          <Area type="monotone" dataKey="value" stroke="#FFA500" strokeWidth={1.5} fill="url(#nx-area)" activeDot={{ r: 4, fill: "#FFA500", stroke: "#030303" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
