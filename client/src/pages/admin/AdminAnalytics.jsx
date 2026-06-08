import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import API from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const admin = (() => {
    try { return JSON.parse(localStorage.getItem("adminInfo")); } catch { return null; }
  })();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/admin/analytics", { headers });
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const chartColors = {
    cyan: "#06b6d4",
    emerald: "#10b981",
    violet: "#8b5cf6",
    amber: "#f59e0b",
    rose: "#f43f5e",
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "var(--bg-secondary)", border: "1px solid var(--surface-border)",
        borderRadius: "var(--radius-md)", padding: "0.6rem 0.85rem",
        fontSize: "0.82rem", boxShadow: "var(--glass-shadow)",
      }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  };

  const ChartCard = ({ title, children, delay = 0 }) => (
    <div className="glass-card-static animate-in" style={{ animationDelay: `${delay}s`, padding: "1.5rem" }}>
      <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", marginBottom: "1.25rem" }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const SkeletonChart = () => (
    <div className="glass-card-static" style={{ padding: "1.5rem" }}>
      <div className="skeleton" style={{ height: 18, width: "40%", marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
    </div>
  );

  return (
    <AdminLayout>
      <div style={{ padding: "2rem 2rem 4rem" }}>
        {/* Header */}
        <div className="animate-in" style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 1.8rem)", marginBottom: "0.2rem" }}>
            <span className="gradient-text-accent">Analytics</span> & Reports
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Visual insights into appointments, doctor workload, and queue performance.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonChart key={i} />)}
          </div>
        ) : !data ? (
          <div className="glass-card-static" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📈</div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>No analytics data available</h3>
            <p style={{ color: "var(--text-muted)" }}>Data will appear as appointments are booked.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: "1.5rem" }}>
            {/* Daily Appointments */}
            <ChartCard title="📅 Daily Appointments (Last 7 Days)" delay={0.05}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.dailyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Appointments" fill={chartColors.cyan} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Weekly Appointments */}
            <ChartCard title="📊 Weekly Appointments (Last 4 Weeks)" delay={0.1}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" name="Appointments" stroke={chartColors.emerald} strokeWidth={3} dot={{ fill: chartColors.emerald, r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Monthly Appointments */}
            <ChartCard title="📆 Monthly Appointments (Last 6 Months)" delay={0.15}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.monthlyData}>
                  <defs>
                    <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.violet} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColors.violet} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Appointments" stroke={chartColors.violet} strokeWidth={2.5} fill="url(#monthlyGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Doctor Workload */}
            <ChartCard title="👨‍⚕️ Doctor Workload" delay={0.2}>
              {data.doctorWorkload.length === 0 ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>No doctor data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(240, data.doctorWorkload.length * 45)}>
                  <BarChart data={data.doctorWorkload} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="appointments" name="Appointments" fill={chartColors.amber} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Queue Trends */}
            <ChartCard title="⏱️ Queue Trends — Avg Wait Time (Last 7 Days)" delay={0.25}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.queueTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} unit="m" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="avgWaitTime" name="Avg Wait (min)" stroke={chartColors.rose} strokeWidth={3} dot={{ fill: chartColors.rose, r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;
