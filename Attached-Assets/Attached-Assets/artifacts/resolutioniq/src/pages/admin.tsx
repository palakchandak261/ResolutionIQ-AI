import { useState } from "react";
import { motion } from "framer-motion";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey, useListDepartments, useCreateDepartment, getListDepartmentsQueryKey, useGetAnalyticsOverview } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Users, Building2, BarChart3, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLES = ["citizen", "officer", "admin"];
const DEPARTMENTS = ["Public Works Department","Sanitation Department","Water Supply Department","Electricity Department","Town Planning Department","Sewage & Drainage Department","General Administration"];

export default function Admin() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading: loadingUsers } = useListUsers();
  const { data: depts, isLoading: loadingDepts } = useListDepartments();
  const { data: overview } = useGetAnalyticsOverview();

  const [userForm, setUserForm] = useState({ name: "", email: "", role: "", department: "" });
  const [deptForm, setDeptForm] = useState({ name: "", code: "", head: "", email: "", slaHours: "72" });
  const [userOpen, setUserOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);

  const createUserMut = useCreateUser({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListUsersQueryKey() }); toast({ title: "User created" }); setUserOpen(false); setUserForm({ name: "", email: "", role: "", department: "" }); } } });
  const deleteUserMut = useDeleteUser({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListUsersQueryKey() }); toast({ title: "User removed" }); } } });
  const createDeptMut = useCreateDepartment({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListDepartmentsQueryKey() }); toast({ title: "Department created" }); setDeptOpen(false); setDeptForm({ name: "", code: "", head: "", email: "", slaHours: "72" }); } } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Control Center</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage users, departments, and platform settings</p>
      </div>

      {/* System stats */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Complaints", value: overview.totalComplaints, icon: BarChart3 },
            { label: "Users", value: users?.length ?? 0, icon: Users },
            { label: "Departments", value: depts?.length ?? 0, icon: Building2 },
            { label: "Active Alerts", value: overview.activeAlerts, icon: BrainCircuit },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-mono">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" />Users</TabsTrigger>
          <TabsTrigger value="departments" className="gap-2"><Building2 className="w-4 h-4" />Departments</TabsTrigger>
        </TabsList>

        {/* Users tab */}
        <TabsContent value="users" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{users?.length ?? 0} total users</span>
            <Dialog open={userOpen} onOpenChange={setUserOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add User</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create User</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Full Name</Label><Input value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Role</Label>
                      <Select value={userForm.role} onValueChange={v => setUserForm(f => ({ ...f, role: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Department</Label>
                      <Select value={userForm.department} onValueChange={v => setUserForm(f => ({ ...f, department: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                        <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d.split(" ")[0]}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full" disabled={!userForm.name || !userForm.email || !userForm.role || createUserMut.isPending}
                    onClick={() => createUserMut.mutate({ data: userForm })}>
                    {createUserMut.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {loadingUsers ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div> : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Name", "Email", "Role", "Department", "Complaints", "Status", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!users?.length ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No users yet</td></tr>
                  ) : users.map((user, i) => (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{user.email}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="capitalize text-[10px]">{user.role}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{user.department || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{user.complaintsHandled}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${user.status === "active" ? "bg-chart-2/10 text-chart-2" : "bg-muted text-muted-foreground"}`}>{user.status}</span></td>
                      <td className="px-4 py-3">
                        <button className="text-muted-foreground hover:text-destructive transition-colors" onClick={() => deleteUserMut.mutate({ id: user.id })}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Departments tab */}
        <TabsContent value="departments" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{depts?.length ?? 0} departments</span>
            <Dialog open={deptOpen} onOpenChange={setDeptOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Department</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Name</Label><Input value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Code</Label><Input placeholder="e.g. PWD" value={deptForm.code} onChange={e => setDeptForm(f => ({ ...f, code: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Head</Label><Input value={deptForm.head} onChange={e => setDeptForm(f => ({ ...f, head: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={deptForm.email} onChange={e => setDeptForm(f => ({ ...f, email: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>SLA Hours</Label><Input type="number" value={deptForm.slaHours} onChange={e => setDeptForm(f => ({ ...f, slaHours: e.target.value }))} /></div>
                  <Button className="w-full" disabled={!deptForm.name || !deptForm.code || createDeptMut.isPending}
                    onClick={() => createDeptMut.mutate({ data: { ...deptForm, slaHours: parseInt(deptForm.slaHours) } })}>
                    {createDeptMut.isPending ? "Creating..." : "Create Department"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {loadingDepts ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div> : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Department", "Code", "Head", "SLA Hours", "Active", "Resolved"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!depts?.length ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No departments yet</td></tr>
                  ) : depts.map((dept, i) => (
                    <motion.tr key={dept.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{dept.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{dept.code}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{dept.head}</td>
                      <td className="px-4 py-3 font-mono text-xs">{dept.slaHours}h</td>
                      <td className="px-4 py-3 font-mono text-xs">{dept.activeComplaints}</td>
                      <td className="px-4 py-3 font-mono text-xs text-chart-2">{dept.totalResolved}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
