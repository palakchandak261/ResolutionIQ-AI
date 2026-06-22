import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetComplaint, useGetComplaintTimeline, useUpdateComplaint, getGetComplaintQueryKey, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SeverityBadge, StatusBadge, AiConfidenceBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Building2, BrainCircuit, CheckCircle2, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  submitted: <CheckCircle2 className="w-4 h-4 text-chart-2" />,
  ai_routed: <BrainCircuit className="w-4 h-4 text-primary" />,
  status_changed: <AlertCircle className="w-4 h-4 text-chart-3" />,
};

export default function GovComplaintDetail() {
  const [, params] = useRoute("/gov/complaint/:id");
  // MongoDB returns string IDs — cast to any so the typed client accepts it
  const id = (params?.id ?? "") as any;
  const qc = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const { data: complaint, isLoading } = useGetComplaint(id, { query: { enabled: !!id } });
  const { data: timeline } = useGetComplaintTimeline(id, { query: { enabled: !!id } });

  const updateMutation = useUpdateComplaint({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetComplaintQueryKey(id) });
        qc.invalidateQueries({ queryKey: getListComplaintsQueryKey() });
        toast({ title: "Complaint updated", description: "Changes saved successfully" });
        setNotes(""); setNewStatus(""); setAssignedTo("");
      },
    },
  });

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  if (!complaint) return <div className="text-center py-20 text-muted-foreground">Complaint not found</div>;

  function handleUpdate() {
    const data: Record<string, string> = {};
    if (newStatus) data.status = newStatus;
    if (notes) data.notes = notes;
    if (assignedTo) data.assignedTo = assignedTo;
    if (Object.keys(data).length === 0) return;
    updateMutation.mutate({ id: complaint!.id, data });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-sm font-mono text-muted-foreground">#{complaint.id}</span>
          <StatusBadge status={complaint.status} />
          <SeverityBadge severity={complaint.severity} />
        </div>
        <h1 className="text-xl font-bold">{complaint.title}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Details + Timeline */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent className="p-4 grid sm:grid-cols-2 gap-3 text-sm">
              <InfoRow label="Category" value={complaint.category} />
              <InfoRow label="Department" value={complaint.department} />
              <InfoRow label="Ward" value={complaint.ward} />
              <InfoRow label="Location" value={complaint.location} />
              <InfoRow label="Filed by" value={complaint.citizenName} />
              <InfoRow label="Email" value={complaint.citizenEmail} />
              <InfoRow label="Est. Resolution" value={`${complaint.estimatedResolutionDays} days`} mono />
              <InfoRow label="Votes" value={String(complaint.votes)} mono />
              {complaint.assignedTo && <InfoRow label="Assigned To" value={complaint.assignedTo} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Description</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{complaint.description}</CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold mb-3">AI Analysis</div>
              <AiConfidenceBadge confidence={complaint.aiConfidence} />
              <p className="text-sm text-muted-foreground leading-relaxed">{complaint.aiSummary}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {!timeline?.length ? (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              ) : (
                <div className="space-y-0">
                  {timeline.map((event, i) => (
                    <div key={event.id} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                          {EVENT_ICONS[event.eventType] ?? <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                        {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pt-1 pb-2">
                        <p className="text-sm font-medium">{event.description}</p>
                        <div className="text-xs text-muted-foreground mt-0.5">{event.actor} · {format(new Date(event.createdAt), "MMM d, HH:mm")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Update Complaint</div>
              <div className="space-y-1.5">
                <Label className="text-xs">Change Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue placeholder="Keep current" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Assign To</Label>
                <input
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Officer name"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea rows={3} placeholder="Add internal notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleUpdate} disabled={updateMutation.isPending || (!newStatus && !notes && !assignedTo)}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Status</div>
              <StatusBadge status={complaint.status} />
              <SeverityBadge severity={complaint.severity} />
              <div className="text-xs text-muted-foreground pt-1">
                Filed {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right font-medium break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
