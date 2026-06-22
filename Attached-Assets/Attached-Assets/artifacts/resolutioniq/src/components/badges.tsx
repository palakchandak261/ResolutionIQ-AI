import React from "react";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    Critical: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-transparent",
    High: "bg-orange-500 text-white hover:bg-orange-600 border-transparent",
    Medium: "bg-amber-400 text-amber-950 hover:bg-amber-500 border-transparent",
    Low: "bg-emerald-500 text-white hover:bg-emerald-600 border-transparent",
  };
  return <Badge variant="outline" className={cn("font-mono font-medium uppercase text-[10px] tracking-wider", map[severity] || map.Low)}>{severity}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-muted text-muted-foreground",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    Escalated: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return <Badge variant="outline" className={cn(map[status] || map.Pending)}>{status}</Badge>;
}

export function AiConfidenceBadge({ confidence }: { confidence: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-medium">
      <BrainCircuit className="w-3.5 h-3.5" />
      <span className="font-mono">{Math.round(confidence * 100)}% Match</span>
    </div>
  );
}
