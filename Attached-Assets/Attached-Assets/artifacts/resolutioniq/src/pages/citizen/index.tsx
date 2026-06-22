import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListComplaints, useVoteComplaint, getListComplaintsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SeverityBadge, StatusBadge, AiConfidenceBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ThumbsUp, MapPin, Clock, BrainCircuit, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CitizenPortal() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const qc = useQueryClient();

  const params: Record<string, string> = {};
  if (statusFilter !== "all") params.status = statusFilter;
  if (categoryFilter !== "all") params.category = categoryFilter;

  const { data: complaints, isLoading } = useListComplaints(
    Object.keys(params).length > 0 ? params : undefined
  );

  const voteMutation = useVoteComplaint({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListComplaintsQueryKey() }),
    },
  });

  const filtered = complaints?.filter(c =>
    search === "" || c.title.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Complaints</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track and manage your civic complaints</p>
        </div>
        <Link href="/citizen/complaint/new">
          <Button className="shrink-0">
            <Plus className="w-4 h-4 mr-2" /> File New Complaint
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Pothole">Pothole</SelectItem>
            <SelectItem value="Garbage">Garbage</SelectItem>
            <SelectItem value="Water Leakage">Water Leakage</SelectItem>
            <SelectItem value="Broken Streetlight">Broken Streetlight</SelectItem>
            <SelectItem value="Illegal Construction">Illegal Construction</SelectItem>
            <SelectItem value="Sewage Overflow">Sewage Overflow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <BrainCircuit className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No complaints found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or file a new complaint</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/citizen/complaint/${c.id}`}>
                <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-medium text-sm group-hover:text-primary transition-colors truncate">{c.title}</span>
                        <StatusBadge status={c.status} />
                        <SeverityBadge severity={c.severity} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.aiSummary}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.ward}</span>
                        <span className="font-mono">{c.category}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                        <AiConfidenceBadge confidence={c.aiConfidence} />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); voteMutation.mutate({ id: c.id }); }}
                        className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-primary/10 transition-colors group/vote"
                      >
                        <ThumbsUp className="w-4 h-4 text-muted-foreground group-hover/vote:text-primary transition-colors" />
                        <span className="text-xs font-mono font-medium">{c.votes}</span>
                      </button>
                      <span className="text-[10px] text-muted-foreground">votes</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
