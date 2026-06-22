import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { useGetComplaint, useGetComplaintTimeline, useVoteComplaint, getGetComplaintQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SeverityBadge, StatusBadge, AiConfidenceBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, MapPin, Clock, Building2, BrainCircuit, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const EVENT_ICONS: Record<string, React.ReactNode> = {
  submitted: <CheckCircle2 className="w-4 h-4 text-chart-2" />,
  ai_routed: <BrainCircuit className="w-4 h-4 text-primary" />,
  status_changed: <AlertCircle className="w-4 h-4 text-chart-3" />,
  assigned: <Building2 className="w-4 h-4 text-chart-5" />,
};

export default function CitizenComplaintDetail() {
  const [, params] = useRoute("/citizen/complaint/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const qc = useQueryClient();

  const { data: complaint, isLoading } = useGetComplaint(id, { query: { enabled: !!id } });
  const { data: timeline } = useGetComplaintTimeline(id, { query: { enabled: !!id } });

  const voteMutation = useVoteComplaint({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetComplaintQueryKey(id) }) },
  });

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  if (!complaint) return <div className="text-center py-20 text-muted-foreground">Complaint not found</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-mono text-muted-foreground">#{complaint.id}</span>
            <StatusBadge status={complaint.status} />
            <SeverityBadge severity={complaint.severity} />
          </div>
          <h1 className="text-xl font-bold">{complaint.title}</h1>
        </div>
        <button
          onClick={() => voteMutation.mutate({ id: complaint.id })}
          className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <ThumbsUp className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-mono font-bold">{complaint.votes}</span>
          <span className="text-[10px] text-muted-foreground">votes</span>
        </button>
      </div>

      {/* Details grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Complaint Details</div>
            <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={complaint.location} />
            <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Ward" value={complaint.ward} />
            <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Department" value={complaint.department} />
            <InfoRow icon={<Clock className="w-3.5 h-3.5" />} label="Filed" value={formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })} />
            <InfoRow label="Category" value={complaint.category} />
            <InfoRow label="Est. Resolution" value={`${complaint.estimatedResolutionDays} days`} mono />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">AI Analysis</div>
            <div className="flex items-center gap-2"><AiConfidenceBadge confidence={complaint.aiConfidence} /></div>
            <p className="text-sm text-muted-foreground leading-relaxed">{complaint.aiSummary}</p>
            {complaint.assignedTo && <InfoRow label="Assigned To" value={complaint.assignedTo} />}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">Description</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-sm leading-relaxed">{complaint.description}</p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {!timeline || timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No timeline events yet</p>
          ) : (
            <div className="relative space-y-0">
              {timeline.map((event, i) => (
                <motion.div key={event.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {EVENT_ICONS[event.eventType] ?? <Clock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pt-1.5 pb-2">
                    <p className="text-sm font-medium">{event.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{event.actor}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground font-mono">{format(new Date(event.createdAt), "MMM d, HH:mm")}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon, label, value, mono = false }: { icon?: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`text-right font-medium truncate ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
