import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Building2, BrainCircuit, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Role = "citizen" | "officer" | "admin";

const ROLES = [
  {
    id: "citizen" as Role,
    label: "Citizen",
    desc: "File complaints, track status, vote on issues in your ward",
    icon: Users,
    color: "border-chart-2/40 hover:border-chart-2 bg-chart-2/5",
    iconColor: "text-chart-2",
    redirect: "/citizen",
  },
  {
    id: "officer" as Role,
    label: "Government Officer",
    desc: "Manage complaint queue, assign tasks, monitor SLA performance",
    icon: ShieldCheck,
    color: "border-primary/40 hover:border-primary bg-primary/5",
    iconColor: "text-primary",
    redirect: "/gov",
  },
  {
    id: "admin" as Role,
    label: "City Administrator",
    desc: "Full platform control — users, departments, analytics, settings",
    icon: BrainCircuit,
    color: "border-chart-5/40 hover:border-chart-5 bg-chart-5/5",
    iconColor: "text-chart-5",
    redirect: "/admin",
  },
];

export default function Login() {
  const [selected, setSelected] = useState<Role | null>(null);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  function handleEnter() {
    if (!selected) return;
    login(selected);
    const r = ROLES.find(r => r.id === selected);
    navigate(r?.redirect ?? "/citizen");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-chart-5 to-chart-2" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-chart-5/8 rounded-full blur-3xl -z-10" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ResolutionIQ AI</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Select your portal</h1>
          <p className="text-muted-foreground text-sm">Choose how you're accessing the platform today</p>
        </div>

        <div className="space-y-3 mb-8">
          {ROLES.map((role) => (
            <motion.div key={role.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Card
                className={`cursor-pointer border-2 transition-all ${selected === role.id ? role.color + " ring-2 ring-offset-2 ring-offset-background " + role.color.replace("hover:", "") : "border-border hover:border-muted-foreground/40"}`}
                onClick={() => setSelected(role.id)}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selected === role.id ? "bg-background" : "bg-muted"}`}>
                    <role.icon className={`w-5 h-5 ${selected === role.id ? role.iconColor : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{role.label}</span>
                      {selected === role.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-2.5 h-2.5 rounded-full ${role.iconColor.replace("text-", "bg-")}`} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{role.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button className="w-full" size="lg" disabled={!selected} onClick={handleEnter}>
          Enter Platform
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">Demo mode — no credentials required</p>
      </motion.div>
    </div>
  );
}
