import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListComplaints, useGetComplaintsSummary, useGetDepartmentWorkload } from "@workspace/api-client-react";
import { SeverityBadge, StatusBadge, AiConfidenceBadge } from "@/components/badges";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, AlertTriangle, TrendingUp, CheckCircle2, Inbox, BrainCircuit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function GovCommandCenter() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const params: Record<string, string> = {};
  if (statusFilter !== "all") params.status = statusFilter;
  if (severityFilter !== "all") params.severity = severityFilter;
  if (deptFilter !== "all") params.department = deptFilter;

  const { data: complaints, isLoading } = useListComplaints(Object.keys(params).length > 0 ? params : undefined);
  const { data: summary } = useGetComplaintsSummary();
  const { data: workload } = useGetDepartmentWorkload();

  const filtered = complaints?.filter(c =>
    search === "" || c.title.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const criticalCount = filtered.filter(c => c.severity === "Critical").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Complaint queue and SLA monitoring</p>
        </div>
        {criticalCount > 0 && (
          <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-xs gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> {criticalCount} Critical {criticalCount === 1 ? "Issue" : "Issues"}
          </Badge>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: summary?.total ?? 0, icon: Inbox, color: "text-foreground" },
          { label: "Pending", value: summary?.pending ?? 0, icon: Clock, color: "text-chart-3" },
          { label: "In Progress", value: summary?.inProgress ?? 0, icon: TrendingUp, color: "text-primary" },
          { label: "Resolved", value: summary?.resolved ?? 0, icon: CheckCircle2, color: "text-chart-2" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold font-mono">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department workload quick view */}
      {workload && workload.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-3">Department Workload</div>
          <div className="flex flex-wrap gap-2">
            {workload.map(d => (
              <div key={d.departmentName} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
                <span className="truncate max-w-[140px]">{d.departmentName}</span>
                <span className="font-mono font-bold text-xs">{d.activeComplaints}</span>
                {d.breachedSla > 0 && <span className="text-[10px] text-destructive font-mono">+{d.breachedSla} SLA</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <BrainCircuit className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No complaints match filters</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Severity</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ward</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Filed</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">AI</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/gov/complaint/${c.id}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{c.id}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-medium truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{c.location.slice(0, 30)}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{c.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><SeverityBadge severity={c.severity} /></td>
                    <td className="px-4 py-3 text-xs font-mono">{c.ward}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</td>
                    <td className="px-4 py-3"><span className="text-xs font-mono text-primary">{Math.round(c.aiConfidence * 100)}%</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
