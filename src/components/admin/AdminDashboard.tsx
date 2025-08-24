import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Shield, 
  Users, 
  Database, 
  Code, 
  Settings, 
  Activity,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  AlertTriangle,
  Home
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminDashboardProps {
  adminUser: any;
  onSignOut: () => void;
  onGoHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onSignOut, onGoHome }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load stats
      const [usersCount, profilesCount, projectsCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('user_type', { count: 'exact' }),
        // Add projects count when projects table exists
        Promise.resolve({ count: 0 })
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        homeowners: profilesCount.data?.filter(p => p.user_type === 'homeowner').length || 0,
        businesses: profilesCount.data?.filter(p => p.user_type === 'business').length || 0,
        projects: projectsCount.count || 0
      });

      // Load recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setUsers(recentUsers || []);

      // Load audit logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select(`
          *,
          admin_users!inner(
            id,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get profile data separately for admin users
      if (logs && logs.length > 0) {
        const adminUserIds = logs.map(log => log.admin_users?.id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', adminUserIds);

        // Merge profile data with logs
        const logsWithProfiles = logs.map(log => ({
          ...log,
          admin_user: {
            ...log.admin_users,
            profiles: profiles?.find(p => p.id === log.admin_users?.id)
          }
        }));

        setAuditLogs(logsWithProfiles);
      } else {
        setAuditLogs(logs || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Log admin logout
      await supabase.rpc('log_admin_action', {
        action_name: 'admin_logout',
        resource_type: 'auth'
      });

      // Invalidate admin session
      await supabase
        .from('admin_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('admin_user_id', adminUser.id);

      // Sign out
      await supabase.auth.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      onSignOut(); // Sign out anyway
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'org_admin': return 'bg-purple-100 text-purple-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'database_admin': return 'bg-green-100 text-green-800';
      case 'support_admin': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'code', name: 'Code', icon: Code },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'audit', name: 'Audit Logs', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        {/* Navigation */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Renova
                </span>
              </div>
              {onGoHome && (
                <Button
                  onClick={onGoHome}
                  variant="outline"
                  size="sm"
                >
                  <Home className="w-4 h-4" />
                  <span className="ml-2">Back to Home</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {adminUser.organization?.name} • {adminUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {adminUser.profiles?.first_name} {adminUser.profiles?.last_name}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(adminUser.role)}`}>
                  {adminUser.role.replace('_', ' ')}
                </span>
              </div>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Homeowners</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.homeowners}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Businesses</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.businesses}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-500" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Projects</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.projects}</p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-500" />
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <Activity className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.user_type === 'business' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.user_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Logs
                  </Button>
                </div>

                <Card className="p-6">
                  <div className="space-y-4">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-600">
                              Resource: {log.resource_type || 'N/A'}
                              {log.resource_id && ` (${log.resource_id})`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {log.admin_user?.profiles?.first_name} {log.admin_user?.profiles?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{log.ip_address}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {['database', 'code', 'settings'].includes(activeTab) && (
              <Card className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tabs.find(t => t.id === activeTab)?.name} Panel
                </h3>
                <p className="text-gray-600">
                  This section is under development. Advanced {activeTab} management features will be available here.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};