import { useState } from "react";
import { motion } from "framer-motion";
import { useListRiskAlerts, useCreateRiskAlert, useUpdateRiskAlert, getListRiskAlertsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SeverityBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BrainCircuit, MapPin, Plus, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const RISK_TYPES = ["Road Failure", "Water Infrastructure", "Electrical Grid", "Sewage System", "Structural", "Environmental"];
const WARDS = ["Ward 1","Ward 2","Ward 3","Ward 4","Ward 5","Ward 6","Ward 7","Ward 8","Ward 9","Ward 10","Ward 11","Ward 12"];

export default function RiskAlerts() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", riskType: "", location: "", ward: "", severity: "", confidence: "0.85" });

  const { data: alerts, isLoading } = useListRiskAlerts();

  const createMutation = useCreateRiskAlert({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListRiskAlertsQueryKey() });
        toast({ title: "Risk alert created", description: "Alert has been added to the system" });
        setOpen(false);
        setForm({ title: "", description: "", riskType: "", location: "", ward: "", severity: "", confidence: "0.85" });
      },
    },
  });

  const resolveMutation = useUpdateRiskAlert({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListRiskAlertsQueryKey() }) },
  });

  const active = alerts?.filter(a => a.status === "Active") ?? [];
  const resolved = alerts?.filter(a => a.status !== "Active") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Predictive Risk Alerts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-generated infrastructure risk predictions based on complaint patterns</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Create Alert</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Risk Alert</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input placeholder="e.g. Potential underground pipe failure" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Risk Type</Label>
                  <Select value={form.riskType} onValueChange={v => setForm(f => ({ ...f, riskType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{RISK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                    <SelectContent>
                      {["Critical","High","Medium","Low"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Ward</Label>
                  <Select value={form.ward} onValueChange={v => setForm(f => ({ ...f, ward: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                    <SelectContent>{WARDS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>AI Confidence (0-1)</Label>
                  <Input type="number" min="0" max="1" step="0.01" value={form.confidence} onChange={e => setForm(f => ({ ...f, confidence: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input placeholder="Specific area or address" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} placeholder="Describe the predicted risk..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <Button className="w-full" disabled={!form.title || !form.riskType || !form.severity || createMutation.isPending}
                onClick={() => createMutation.mutate({ data: { ...form, confidence: parseFloat(form.confidence), relatedComplaintIds: [] } })}>
                {createMutation.isPending ? "Creating..." : "Create Risk Alert"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active alerts summary */}
      {active.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <span className="font-semibold text-destructive">{active.length} active risk {active.length === 1 ? "alert" : "alerts"}</span>
            <span className="text-muted-foreground text-sm ml-2">requiring attention</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : !alerts?.length ? (
        <div className="text-center py-20 border border-border rounded-xl bg-card">
          <BrainCircuit className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No risk alerts</p>
          <p className="text-sm text-muted-foreground mt-1">AI will generate alerts when complaint patterns indicate risk</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div key={alert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={`border-2 ${alert.status === "Active" ? "border-destructive/20 bg-destructive/5" : "border-border opacity-60"}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <SeverityBadge severity={alert.severity} />
                        <Badge variant="outline" className="text-[10px] font-mono">{alert.riskType}</Badge>
                        <Badge variant={alert.status === "Active" ? "destructive" : "secondary"} className="text-[10px]">{alert.status}</Badge>
                        <span className="text-xs font-mono text-primary ml-auto">{Math.round(alert.confidence * 100)}% confidence</span>
                      </div>
                      <h3 className="font-semibold mb-1">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{alert.location}</span>
                        <span className="font-mono">{alert.ward}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>
                        {alert.relatedComplaintIds?.length > 0 && (
                          <span>{alert.relatedComplaintIds.length} related complaints</span>
                        )}
                      </div>
                    </div>
                    {alert.status === "Active" && (
                      <Button size="sm" variant="outline" className="shrink-0 text-chart-2 border-chart-2/40 hover:bg-chart-2/10"
                        onClick={() => resolveMutation.mutate({ id: alert.id, data: { status: "Resolved" } })}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Resolve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
