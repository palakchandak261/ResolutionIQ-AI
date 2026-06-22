import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Building2, 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  FileText, 
  LogOut,
  ShieldAlert,
  Inbox,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, logout } = useAuth();
  const [location] = useLocation();

  if (!role) {
    return <>{children}</>;
  }

  const navItems = {
    officer: [
      { href: "/gov", label: "Command Center", icon: Inbox },
      { href: "/dashboard", label: "Civic Dashboard", icon: LayoutDashboard },
      { href: "/risk", label: "Risk Alerts", icon: AlertTriangle },
    ],
    citizen: [
      { href: "/citizen", label: "My Complaints", icon: FileText },
      { href: "/citizen/complaint/new", label: "New Complaint", icon: ShieldAlert },
    ],
    admin: [
      { href: "/admin", label: "User Management", icon: Users },
      { href: "/dashboard", label: "System Analytics", icon: LayoutDashboard },
    ]
  };

  const links = navItems[role] || [];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border gap-2">
          <Building2 className="w-6 h-6 text-sidebar-primary" />
          <span className="font-bold tracking-tight text-lg">ResolutionIQ</span>
        </div>
        
        <div className="p-4">
          <div className="text-xs uppercase tracking-wider text-sidebar-foreground/50 font-mono mb-4 px-2">
            {role.toUpperCase()} PORTAL
          </div>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  location === link.href 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <UserCircle className="w-8 h-8 text-sidebar-foreground/60" />
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">Jane Doe</span>
              <span className="text-xs text-sidebar-foreground/50">{role}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/20">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
