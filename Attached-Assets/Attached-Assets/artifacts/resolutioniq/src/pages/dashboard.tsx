import { motion } from "framer-motion";
import {
  useGetAnalyticsOverview,
  useGetCategoryBreakdown,
  useGetSeverityBreakdown,
  useGetWardHeatmap,
  useGetResolutionTrends,
  useGetSlaBreachRisk,
  useGetDepartmentWorkload,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/badges";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { TrendingUp, CheckCircle2, BrainCircuit, AlertTriangle, ShieldCheck, MapPin, Zap, Users } from "lucide-react";

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const CHART_COLORS = ["hsl(199,89%,42%)", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#06b6d4"];

export default function Dashboard() {
  const { data: overview, isLoading: loadingOverview } = useGetAnalyticsOverview();
  const { data: categories } = useGetCategoryBreakdown();
  const { data: severities } = useGetSeverityBreakdown();
  const { data: wards } = useGetWardHeatmap();
  const { data: trends } = useGetResolutionTrends();
  const { data: slaRisk } = useGetSlaBreachRisk();
  const { data: workload } = useGetDepartmentWorkload();

  const kpis = overview ? [
    { label: "Total Complaints", value: overview.totalComplaints, icon: BrainCircuit, suffix: "", color: "text-primary" },
    { label: "Resolution Rate", value: overview.resolutionRate.toFixed(1), icon: CheckCircle2, suffix: "%", color: "text-chart-2" },
    { label: "AI Routing Accuracy", value: overview.aiRoutingAccuracy.toFixed(1), icon: Zap, suffix: "%", color: "text-chart-2" },
    { label: "Avg Response Time", value: overview.avgResponseTimeHours.toFixed(1), icon: TrendingUp, suffix: "h", color: "text-chart-3" },
    { label: "Citizen Satisfaction", value: overview.citizenSatisfaction.toFixed(0), icon: Users, suffix: "%", color: "text-chart-2" },
    { label: "Active Risk Alerts", value: overview.activeAlerts, icon: AlertTriangle, suffix: "", color: "text-destructive" },
    { label: "Duplicates Blocked", value: overview.duplicatesBlocked, icon: ShieldCheck, suffix: "", color: "text-primary" },
    { label: "Wards Covered", value: overview.wardsCovered, icon: MapPin, suffix: "", color: "text-chart-5" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Civic Intelligence Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Real-time analytics across all wards and departments</p>
      </div>

      {/* KPI grid */}
      {loadingOverview ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <div className="text-2xl font-bold font-mono">{kpi.value}{kpi.suffix}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">Complaints by Category</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!categories?.length ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categories} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} tickFormatter={v => v.split(" ")[0]} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="hsl(199,89%,42%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Severity breakdown */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex items-center justify-center gap-6">
            {!severities?.length ? <Skeleton className="h-48 w-full" /> : (
              <>
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={severities} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {severities.map((entry) => (
                        <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {severities.map(s => (
                    <div key={s.severity} className="flex items-center gap-2 text-sm">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: SEVERITY_COLORS[s.severity] }} />
                      <span className="text-muted-foreground text-xs">{s.severity}</span>
                      <span className="font-mono font-bold text-xs ml-auto">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resolution trends */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">Resolution Trends (Weekly)</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {!trends?.length ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="hsl(199,89%,42%)" strokeWidth={2} dot={false} name="Submitted" />
                <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={false} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Ward heatmap */}
      {wards && wards.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">Ward Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {wards.map(w => {
                const intensity = w.severity === "Critical" ? "bg-destructive/80 text-destructive-foreground" :
                  w.severity === "High" ? "bg-orange-500/70 text-white" :
                  w.count > 3 ? "bg-primary/50 text-primary-foreground" : "bg-primary/20 text-primary";
                return (
                  <div key={w.ward} className={`rounded-lg p-3 text-center transition-all ${intensity}`}>
                    <div className="text-xs font-mono font-bold">{w.count}</div>
                    <div className="text-[10px] mt-0.5 font-medium">{w.ward}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary/20" /> Low</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary/50" /> Medium</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500/70" /> High</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-destructive/80" /> Critical</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* SLA breach risk */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">SLA Breach Risk</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!slaRisk ? <Skeleton className="h-40 w-full" /> :
              slaRisk.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">All complaints within SLA</p> : (
                <div className="space-y-2">
                  {slaRisk.slice(0, 6).map(r => (
                    <div key={r.complaintId} className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{r.title}</div>
                        <div className="text-muted-foreground font-mono">{r.department.split(" ")[0]} · {r.hoursElapsed}h elapsed / {r.slaHours}h SLA</div>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${r.riskLevel === "Breached" ? "bg-destructive/10 text-destructive" : "bg-chart-3/10 text-chart-3"}`}>{r.riskLevel}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </CardContent>
        </Card>

        {/* Department workload chart */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">Department Load</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!workload ? <Skeleton className="h-40 w-full" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={workload} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="departmentName" tick={{ fontSize: 9 }} tickFormatter={v => v.split(" ")[0]} width={60} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="activeComplaints" fill="hsl(199,89%,42%)" radius={[0, 4, 4, 0]} name="Active" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
