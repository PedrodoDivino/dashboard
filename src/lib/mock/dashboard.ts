/** "platform" = visão de quem tem dashboard.platform_metrics; "personal" = visão do próprio usuário. */
export type MetricScope = "platform" | "personal";

// Números de exemplo da Home (métricas e gráfico). Viram queries reais quando o produto tiver dados próprios.

export type MetricKey = "activeUsers" | "revenue" | "requests" | "uptime" | "myRequests" | "planUsage" | "savedViews" | "latency";

export type MetricFormat = "number" | "compact" | "currency" | "percent" | "ms";

export interface Metric {
  key: MetricKey;
  value: number;
  format: MetricFormat;
  delta: number; // variação em % contra o período anterior
  /** Quando true, queda é boa (ex.: latência). */
  lowerIsBetter?: boolean;
}

export const metricsByScope: Record<MetricScope, Metric[]> = {
  platform: [
    { key: "activeUsers", value: 1284, format: "number", delta: 12.4 },
    { key: "revenue", value: 48200, format: "currency", delta: 8.1 },
    { key: "requests", value: 2400000, format: "compact", delta: 21.7 },
    { key: "uptime", value: 0.9998, format: "percent", delta: 0.02 },
  ],
  personal: [
    { key: "myRequests", value: 18420, format: "number", delta: 6.3 },
    { key: "planUsage", value: 0.62, format: "percent", delta: 4.0 },
    { key: "savedViews", value: 14, format: "number", delta: 16.6 },
    { key: "latency", value: 24, format: "ms", delta: -3.2, lowerIsBetter: true },
  ],
};

export interface SeriesPoint {
  date: string; // ISO yyyy-mm-dd
  value: number;
}

function buildSeries(base: number, amplitude: number, seed: number): SeriesPoint[] {
  const end = new Date("2026-10-03T00:00:00Z");
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - (29 - i));
    const wave = Math.sin((i + seed) / 3.2) * amplitude + Math.cos((i * seed) / 7) * amplitude * 0.4;
    const trend = i * (amplitude / 12);
    return { date: d.toISOString().slice(0, 10), value: Math.round(base + wave + trend) };
  });
}

export const seriesByScope: Record<MetricScope, SeriesPoint[]> = {
  platform: buildSeries(62000, 9000, 3),
  personal: buildSeries(520, 140, 5),
};

