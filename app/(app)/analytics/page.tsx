"use client";
import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, Cell,
} from "recharts";
import Header from "@/components/layout/Header";

interface ActivityWeek {
  week: string;
  communications: number;
  followups: number;
  documents: number;
}
interface PipelineMonth {
  month: string;
  value: number;
  won_value: number;
}
interface HealthDist {
  health_status: string;
  count: number;
}
interface HealthTrendPoint {
  day: string;
  avg_score: number;
}
interface AnalyticsData {
  activityVolume: ActivityWeek[];
  pipelineTrend: PipelineMonth[];
  healthDistribution: HealthDist[];
  healthTrend: HealthTrendPoint[];
  healthTrendAvailable: boolean;
}

const healthColor: Record<string, string> = {
  active: "#15803d", steady: "#2563eb", quiet: "#b45309", at_risk: "#dc2626",
};
const healthLabel: Record<string, string> = {
  active: "Active", steady: "Steady", quiet: "Quiet", at_risk: "At Risk",
};

function fmtWeek(w: string | number | undefined) {
  if (!w) return "";
  const d = new Date(String(w));
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}
function fmtMonth(m: string | number | undefined) {
  if (!m) return "";
  const [y, mo] = String(m).split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
}
function fmtCurrency(v: number) {
  return `R ${v.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/db/analytics")
      .then(r => { if (!r.ok) throw new Error("Failed to load analytics"); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header title="Analytics" subtitle="Trends and patterns across your client base" />
      <div className="page-content-pad" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {loading && <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading analytics...</div>}
        {error && <div style={{ padding: 40, textAlign: "center", color: "var(--accent-red)" }}>{error}</div>}

        {data && (
          <>
            {/* Activity Volume */}
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Activity Volume</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>Communications, follow-ups, and documents created — last 12 weeks</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.activityVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tickFormatter={fmtWeek} tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" allowDecimals={false} />
                  <Tooltip labelFormatter={(l: any) => fmtWeek(l)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="communications" name="Communications" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="followups" name="Follow-ups" stroke="#15803d" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="documents" name="Documents" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pipeline Value Trend */}
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Pipeline Value Trend</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>Document value created per month, vs. won (accepted/approved) — last 12 months</div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.pipelineTrend}>
                  <defs>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tickFormatter={fmtMonth} tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" tickFormatter={v => `R${(v / 1000).toFixed(0)}k`} />
                  <Tooltip labelFormatter={(l: any) => fmtMonth(l)} formatter={(v: any) => fmtCurrency(Number(v))} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" name="Total Value" stroke="#2563eb" fill="url(#valueGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="won_value" name="Won Value" stroke="#15803d" fill="url(#wonGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="two-col-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Health Distribution */}
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Client Health Distribution</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>Current snapshot across your client base</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.healthDistribution.map(h => ({ ...h, label: healthLabel[h.health_status] || h.health_status }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.healthDistribution.map((h, i) => (
                        <Cell key={i} fill={healthColor[h.health_status] || "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Health Trend */}
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Client Health Trend</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>Average health score across all clients, over time</div>
                {data.healthTrendAvailable ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data.healthTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="day" tickFormatter={fmtWeek} tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                      <Tooltip labelFormatter={(l: any) => fmtWeek(l)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="avg_score" name="Avg Health Score" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7 }}>
                      No trend history yet — this chart starts collecting a data point per day<br />
                      from the health score cron. Check back after a few days of runs.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
