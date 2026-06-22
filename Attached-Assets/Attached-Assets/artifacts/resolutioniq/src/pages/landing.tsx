import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Building2, BrainCircuit, ShieldCheck, TrendingUp, Zap, Globe,
  ArrowRight, CheckCircle2, MapPin, Clock, BarChart3, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetComplaintsSummary, useGetAnalyticsOverview } from "@workspace/api-client-react";

const CATEGORIES = [
  { name: "Pothole", color: "bg-orange-500" },
  { name: "Garbage Dump", color: "bg-red-500" },
  { name: "Water Leakage", color: "bg-blue-500" },
  { name: "Broken Streetlight", color: "bg-yellow-500" },
  { name: "Illegal Construction", color: "bg-purple-500" },
  { name: "Sewage Overflow", color: "bg-emerald-500" },
];

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI Complaint Intelligence",
    desc: "Automatic classification, department routing, severity prediction, and duplicate detection — powered by Gemini.",
  },
  {
    icon: ShieldCheck,
    title: "Predictive Risk Engine",
    desc: "Clusters geospatial complaint patterns to forecast infrastructure failures before they escalate.",
  },
  {
    icon: Globe,
    title: "Multilingual Voice Support",
    desc: "Citizens file complaints in English, Hindi, Marathi, and regional languages via voice. AI transcribes and translates.",
  },
  {
    icon: BarChart3,
    title: "Civic Intelligence Dashboard",
    desc: "Ward heatmaps, resolution trends, SLA monitoring, and department workload analytics in real-time.",
  },
  {
    icon: Clock,
    title: "SLA Breach Prevention",
    desc: "Automated escalation and real-time SLA risk scoring keep complaints from falling through the cracks.",
  },
  {
    icon: Zap,
    title: "Government Command Center",
    desc: "Officers get an intelligent queue with AI recommendations, priority scoring, and one-click assignment.",
  },
];

function AnimatedCounter({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="font-mono font-bold"
    >
      {value}{suffix}
    </motion.span>
  );
}

export default function Landing() {
  const { login } = useAuth();
  const { data: summary } = useGetComplaintsSummary();
  const { data: overview } = useGetAnalyticsOverview();

  const stats = [
    { label: "Complaints Resolved", value: summary?.resolved ?? 1247, suffix: "+" },
    { label: "AI Routing Accuracy", value: overview?.aiRoutingAccuracy?.toFixed(1) ?? "97.3", suffix: "%" },
    { label: "Avg. Resolution Time", value: summary?.avgResolutionDays?.toFixed(1) ?? "4.2", suffix: " days" },
    { label: "Cities Covered", value: 12, suffix: "" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">ResolutionIQ AI</span>
            <Badge variant="outline" className="text-[10px] font-mono ml-1 hidden sm:inline-flex">BETA</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="hidden sm:flex">Get Started <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-chart-5/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 text-xs font-mono px-3 py-1 bg-primary/10 text-primary border-primary/20">
              <BrainCircuit className="w-3 h-3 mr-1.5" />
              AI-Powered Civic Intelligence Platform
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
              File It Right.<br />
              <span className="text-primary">Get It Fixed.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              ResolutionIQ AI transforms how cities manage civic complaints — from chaotic inboxes to intelligent, prioritized, AI-routed infrastructure intelligence.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/login">
                <Button size="lg" className="font-medium" onClick={() => login("citizen")}>
                  File a Complaint <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="font-medium" onClick={() => login("officer")}>
                  Government Portal
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 border-y border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-foreground">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-muted-foreground mt-1 font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem → Solution flow */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Cities are drowning in complaints they can't act on</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Wrong department. Poor detail. Duplicate tickets. Zero follow-through. ResolutionIQ fixes all of it.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-14">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
              <div className="text-sm font-mono font-semibold text-destructive mb-4 uppercase tracking-wider">Without ResolutionIQ</div>
              {["Citizens call the wrong department", "Complaints lack actionable details", "Duplicate tickets flood the system", "No prioritization — everything is urgent", "No predictive intelligence"].map(p => (
                <div key={p} className="flex items-start gap-2.5 mb-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  <span className="text-sm text-muted-foreground">{p}</span>
                </div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <div className="text-sm font-mono font-semibold text-primary mb-4 uppercase tracking-wider">With ResolutionIQ</div>
              {["AI auto-routes to the right department", "AI drafts structured complaint summaries", "Duplicate detection blocks noise", "Severity + priority scoring for every complaint", "Predictive risk alerts before failure occurs"].map(p => (
                <div key={p} className="flex items-start gap-2.5 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Issue categories */}
      <section className="py-16 px-6 bg-card/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Covers every civic issue type</h2>
            <p className="text-muted-foreground text-sm">AI-powered computer vision detects and classifies issues automatically</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.name} whileHover={{ scale: 1.03 }} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card cursor-default">
                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Built for the entire civic ecosystem</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From individual citizen to city administrator — every stakeholder gets a purpose-built interface.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your city?</h2>
              <p className="text-muted-foreground mb-8">Join municipalities already using ResolutionIQ to move from reactive problem-solving to proactive infrastructure intelligence.</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/login">
                  <Button size="lg" onClick={() => login("citizen")}>File a Complaint <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" onClick={() => login("officer")}>Government Login</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" onClick={() => login("admin")}>Admin Access</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>ResolutionIQ AI — Civic Intelligence Platform</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">"File It Right. Get It Fixed."</div>
        </div>
      </footer>
    </div>
  );
}
