import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  FlaskConical, 
  Eye, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  X, 
  Loader2, 
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { usersApi, type ManagedUser } from '@/api/users.api';

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    color: 'text-primary-400 bg-primary-600/20 border-primary-500/30',
    icon: ShieldCheck,
    description: 'Full laboratory access, user management, and system governance',
  },
  technician: {
    label: 'Technician',
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    icon: FlaskConical,
    description: 'Sample creation, workflow status transitions, and analytical notes',
  },
  viewer: {
    label: 'Viewer',
    color: 'text-surface-400 bg-surface-700/30 border-surface-600/30',
    icon: Eye,
    description: 'Read-only access to samples, audit trails, and reporting dashboards',
  },
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Edit modal state
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'technician' | 'viewer'>('technician');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal state
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.list();
      setUsers(res.data.users);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load user accounts');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open edit modal
  const handleOpenEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
  };

  // Submit edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      const res = await usersApi.update(editingUser._id, {
        name: editName.trim(),
        role: editRole,
      });
      setUsers(prev => prev.map(u => u._id === editingUser._id ? res.data.user : u));
      toast.success(`Updated user '${res.data.user.name}' successfully`);
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit delete
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await usersApi.delete(deletingUser._id);
      setUsers(prev => prev.filter(u => u._id !== deletingUser._id));
      toast.success(`Deleted '${deletingUser.name}' from the system`);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalTechs = users.filter(u => u.role === 'technician').length;
  const totalViewers = users.filter(u => u.role === 'viewer').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-surface-100 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-500" />
            User Management
          </h1>
          <p className="text-surface-400 mt-1">
            Manage laboratory staff, assign role permissions, and control platform access
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-heading font-bold text-surface-100 mt-1">{users.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-600/15 flex items-center justify-center text-primary-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Administrators</p>
            <p className="text-2xl font-heading font-bold text-primary-400 mt-1">{totalAdmins}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Technicians</p>
            <p className="text-2xl font-heading font-bold text-blue-400 mt-1">{totalTechs}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <FlaskConical className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">Viewers</p>
            <p className="text-2xl font-heading font-bold text-surface-300 mt-1">{totalViewers}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center text-surface-400">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 text-surface-100 placeholder-surface-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'admin', 'technician', 'viewer'].map((roleKey) => (
            <button
              key={roleKey}
              onClick={() => setSelectedRoleFilter(roleKey)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                selectedRoleFilter === roleKey
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-surface-900 border border-surface-700 text-surface-400 hover:text-surface-200'
              }`}
            >
              {roleKey}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / List */}
      <div className="glass-card rounded-2xl overflow-hidden border border-surface-800">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-surface-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-surface-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-surface-600" />
            <p className="text-lg font-medium text-surface-200">No personnel found</p>
            <p className="text-sm text-surface-500 mt-1">Try adjusting your search terms or filter selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-800 bg-surface-900/40 text-xs font-semibold text-surface-400 uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role Tier</th>
                  <th className="py-4 px-6">Registered On</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60 text-sm">
                {filteredUsers.map((u) => {
                  const roleConfig = ROLE_CONFIG[u.role] || ROLE_CONFIG.viewer;
                  const isCurrentAccount = u._id === currentUser?._id;
                  const RoleIcon = roleConfig.icon;

                  return (
                    <tr key={u._id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white font-semibold flex items-center justify-center text-sm shadow-sm shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-surface-100">{u.name}</span>
                              {isCurrentAccount && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary-600/15 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/20">
                                  <UserCheck className="w-3 h-3" /> You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-surface-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${roleConfig.color}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleConfig.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-surface-400 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 rounded-lg text-surface-400 hover:text-primary-400 hover:bg-primary-600/10 transition-colors"
                            title="Edit Role or Name"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isCurrentAccount}
                            className={`p-2 rounded-lg transition-colors ${
                              isCurrentAccount
                                ? 'text-surface-600 cursor-not-allowed opacity-40'
                                : 'text-surface-400 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                            title={isCurrentAccount ? 'Cannot delete your own active account' : 'Delete User'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !isUpdating && setEditingUser(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-surface-950 border border-surface-800 rounded-2xl shadow-2xl p-6 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-surface-800 pb-4">
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-surface-100">Edit User Details</h2>
                    <p className="text-xs text-surface-400 mt-0.5">{editingUser.email}</p>
                  </div>
                  <button
                    onClick={() => setEditingUser(null)}
                    disabled={isUpdating}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={100}
                      className="w-full px-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Access Role & Permissions
                    </label>
                    <div className="space-y-2.5">
                      {(['admin', 'technician', 'viewer'] as const).map((r) => {
                        const cfg = ROLE_CONFIG[r];
                        const Icon = cfg.icon;
                        const isSelected = editRole === r;

                        return (
                          <div
                            key={r}
                            onClick={() => setEditRole(r)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                              isSelected
                                ? 'border-primary-500 bg-primary-600/15 ring-1 ring-primary-500/50'
                                : 'border-surface-800 bg-surface-900/40 hover:bg-surface-800/40'
                            }`}
                          >
                            <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-primary-300' : 'text-surface-200'}`}>
                                  {cfg.label}
                                </span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-400" />}
                              </div>
                              <p className="text-xs text-surface-400 mt-0.5">{cfg.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-800">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      disabled={isUpdating}
                      className="px-4 py-2.5 rounded-xl border border-surface-700 text-surface-300 text-sm font-medium hover:bg-surface-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !isDeleting && setDeletingUser(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-surface-950 border border-surface-800 rounded-2xl shadow-2xl p-6 space-y-5"
              >
                <div className="flex items-center gap-3.5 text-red-400">
                  <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-surface-100">Delete User Account</h3>
                    <p className="text-xs text-surface-400">This action is permanent and cannot be reversed.</p>
                  </div>
                </div>

                <p className="text-sm text-surface-300">
                  Are you sure you want to delete <span className="font-semibold text-surface-100">{deletingUser.name}</span> (<span className="text-surface-400 font-mono text-xs">{deletingUser.email}</span>)?
                </p>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-800">
                  <button
                    type="button"
                    onClick={() => setDeletingUser(null)}
                    disabled={isDeleting}
                    className="px-4 py-2.5 rounded-xl border border-surface-700 text-surface-300 text-sm font-medium hover:bg-surface-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Delete Account
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
