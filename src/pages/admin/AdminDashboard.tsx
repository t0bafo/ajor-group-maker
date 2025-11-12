import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, Shield, Eye, MoreVertical, Edit, RotateCcw, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { EditGroupDialog } from "@/components/admin/EditGroupDialog";
import { ResetGroupDialog } from "@/components/admin/ResetGroupDialog";
import { DeleteGroupDialog } from "@/components/admin/DeleteGroupDialog";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoading, getAdminLogs } = useAdmin();
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalUsers: 0,
    activeCycles: 0,
    totalVolume: 0,
  });
  const [groups, setGroups] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [editGroup, setEditGroup] = useState<any>(null);
  const [resetGroup, setResetGroup] = useState<any>(null);
  const [deleteGroup, setDeleteGroup] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all groups
      const { data: groupsData } = await supabase
        .from('groups')
        .select('*, members(count)')
        .order('created_at', { ascending: false });

      if (groupsData) {
        setGroups(groupsData);
        setStats(prev => ({ ...prev, totalGroups: groupsData.length }));
      }

      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userCount) {
        setStats(prev => ({ ...prev, totalUsers: userCount }));
      }

      // Fetch active cycles
      const { count: cycleCount } = await supabase
        .from('cycles')
        .select('*', { count: 'exact', head: true })
        .eq('payout_status', 'pending');

      if (cycleCount) {
        setStats(prev => ({ ...prev, activeCycles: cycleCount }));
      }

      // Fetch total volume
      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount')
        .eq('contribution_status', 'paid');

      if (contributions) {
        const total = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
        setStats(prev => ({ ...prev, totalVolume: total }));
      }

      // Fetch recent admin logs
      const logsResult = await getAdminLogs(20);
      if (logsResult.success) {
        setLogs(logsResult.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminBadge />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">System-wide overview and controls</p>
        </div>
        <Badge variant="destructive" className="text-sm">Pilot Mode</Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cycles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCycles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalVolume.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* All Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Groups</CardTitle>
          <CardDescription>Manage and view all groups in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.group_name}</TableCell>
                  <TableCell>
                    <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                      {group.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{group.number_of_members}</TableCell>
                  <TableCell>{format(new Date(group.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          sessionStorage.setItem('currentGroupId', group.id);
                          navigate('/group-dashboard');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem
                            onClick={() => setEditGroup(group)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setResetGroup(group)}
                            className="cursor-pointer text-amber-600 dark:text-amber-500"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteGroup(group)}
                            className="cursor-pointer text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Admin Action Dialogs */}
      {editGroup && (
        <EditGroupDialog
          open={!!editGroup}
          onOpenChange={(open) => !open && setEditGroup(null)}
          group={editGroup}
          onSuccess={fetchDashboardData}
        />
      )}
      
      {resetGroup && (
        <ResetGroupDialog
          open={!!resetGroup}
          onOpenChange={(open) => !open && setResetGroup(null)}
          group={resetGroup}
          onSuccess={fetchDashboardData}
        />
      )}
      
      {deleteGroup && (
        <DeleteGroupDialog
          open={!!deleteGroup}
          onOpenChange={(open) => !open && setDeleteGroup(null)}
          group={deleteGroup}
          onSuccess={fetchDashboardData}
        />
      )}

      {/* Recent Admin Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Activity</CardTitle>
          <CardDescription>Last 20 administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action.replace(/_/g, ' ')}</TableCell>
                  <TableCell>
                    {log.target_type && (
                      <Badge variant="outline">
                        {log.target_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
