import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Check if user has admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
      }

      setIsAdmin(!!data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
      setIsLoading(false);
    }
  };

  const logAdminAction = async (params: {
    action: string;
    targetType?: string;
    targetId?: string;
    details?: Record<string, any>;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        action: params.action,
        target_type: params.targetType || null,
        target_id: params.targetId || null,
        details: params.details || null,
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const updateContribution = async (
    contributionId: string,
    updates: {
      amount?: number;
      payment_date?: string;
      contribution_status?: string;
      payment_method?: string;
      note?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('contributions')
        .update(updates)
        .eq('id', contributionId);

      if (error) throw error;

      await logAdminAction({
        action: 'update_contribution',
        targetType: 'contribution',
        targetId: contributionId,
        details: updates,
      });

      toast({
        title: "Contribution Updated",
        description: "The contribution has been successfully updated.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteContribution = async (contributionId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('contributions')
        .delete()
        .eq('id', contributionId);

      if (error) throw error;

      await logAdminAction({
        action: 'delete_contribution',
        targetType: 'contribution',
        targetId: contributionId,
        details: { reason },
      });

      toast({
        title: "Contribution Deleted",
        description: "The contribution has been permanently deleted.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateCycleDates = async (
    cycleId: string,
    dates: {
      start_date?: string;
      end_date?: string;
      payout_date?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('cycles')
        .update(dates)
        .eq('id', cycleId);

      if (error) throw error;

      await logAdminAction({
        action: 'update_cycle_dates',
        targetType: 'cycle',
        targetId: cycleId,
        details: dates,
      });

      toast({
        title: "Cycle Dates Updated",
        description: "The cycle dates have been successfully updated.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const removeMember = async (memberId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await logAdminAction({
        action: 'remove_member',
        targetType: 'member',
        targetId: memberId,
        details: { reason },
      });

      toast({
        title: "Member Removed",
        description: "The member has been removed from the group.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const getAdminLogs = async (limit = 50, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, data: data as AdminLog[] };
    } catch (error: any) {
      console.error('Error fetching admin logs:', error);
      return { success: false, error, data: [] };
    }
  };

  const updateGroup = async (
    groupId: string,
    updates: {
      group_name?: string;
      contribution_amount?: number;
      frequency?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId);

      if (error) throw error;

      await logAdminAction({
        action: 'edit_group',
        targetType: 'group',
        targetId: groupId,
        details: { changes: updates },
      });

      toast({
        title: "Group Updated",
        description: "The group settings have been successfully updated.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const resetGroup = async (groupId: string, groupName: string) => {
    try {
      // Get counts for logging
      const [contributionsResult, payoutsResult] = await Promise.all([
        supabase.from('contributions').select('id, amount', { count: 'exact' }).eq('group_id', groupId),
        supabase.from('payouts').select('id', { count: 'exact' }).eq('group_id', groupId),
      ]);

      const contributionsCount = contributionsResult.count || 0;
      const contributionsTotal = contributionsResult.data?.reduce((sum, c) => sum + parseFloat(c.amount as any), 0) || 0;
      const payoutsCount = payoutsResult.count || 0;

      // Delete all contributions and payouts
      await Promise.all([
        supabase.from('contributions').delete().eq('group_id', groupId),
        supabase.from('payouts').delete().eq('group_id', groupId),
        supabase.from('cycles').delete().eq('group_id', groupId),
      ]);

      // Reset group to not started
      await supabase
        .from('groups')
        .update({ start_date: null, status: 'active' })
        .eq('id', groupId);

      await logAdminAction({
        action: 'reset_group',
        targetType: 'group',
        targetId: groupId,
        details: {
          groupName,
          deletedItems: {
            contributions: contributionsCount,
            contributionsTotal,
            payouts: payoutsCount,
          },
        },
      });

      toast({
        title: "Group Reset",
        description: `${groupName} has been reset to initial state.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteGroup = async (groupId: string, groupName: string) => {
    try {
      // Get member count for notification
      const { count: memberCount } = await supabase
        .from('members')
        .select('id', { count: 'exact' })
        .eq('group_id', groupId);

      // Delete all related records (cascading)
      await supabase.from('groups').delete().eq('id', groupId);

      await logAdminAction({
        action: 'delete_group',
        targetType: 'group',
        targetId: groupId,
        details: {
          groupName,
          memberCount: memberCount || 0,
        },
      });

      toast({
        title: "Group Deleted",
        description: `${groupName} has been permanently deleted.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return {
    isAdmin,
    isLoading,
    logAdminAction,
    updateContribution,
    deleteContribution,
    updateCycleDates,
    removeMember,
    getAdminLogs,
    updateGroup,
    resetGroup,
    deleteGroup,
  };
};
