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
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { usersApi, type ManagedUser } from '@/api/users.api';
import { Badge, Button, Input, Skeleton, SpotlightCard } from '@/components/ui/primitives';

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    color: 'text-primary-300 bg-primary-500/10 border-primary-400/20',
    icon: ShieldCheck,
    description: 'Full laboratory access, user management, and system governance',
  },
  technician: {
    label: 'Technician',
    color: 'text-status-in-progress bg-status-in-progress-bg border-status-in-progress/20',
    icon: FlaskConical,
    description: 'Sample creation, workflow status transitions, and analytical notes',
  },
  viewer: {
    label: 'Viewer',
    color: 'text-surface-300 bg-surface-700/30 border-surface-600/25',
    icon: Eye,
    description: 'Read-only access to samples, audit trails, and reporting dashboards',
  },
};

const roleFilters = ['all', 'admin', 'technician', 'viewer'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'technician' | 'viewer'>('technician');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleOpenEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      const res = await usersApi.update(editingUser._id, {
        name: editName.trim(),
        role: editRole,
      });
      setUsers(prev => prev.map(user => user._id === editingUser._id ? res.data.user : user));
      toast.success(`Updated user '${res.data.user.name}' successfully`);
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await usersApi.delete(deletingUser._id);
      setUsers(prev => prev.filter(user => user._id !== deletingUser._id));
      toast.success(`Deleted '${deletingUser.name}' from the system`);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || user.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter(user => user.role === 'admin').length;
  const totalTechs = users.filter(user => user.role === 'technician').length;
  const totalViewers = users.filter(user => user.role === 'viewer').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="mx-auto max-w-7xl space-y-5 py-1 sm:space-y-6"
    >
      <div className="flex items-center gap-3.5">
        <span className="hidden h-11 w-11 items-center justify-center rounded-xl border border-primary-300/15 bg-gradient-to-br from-primary-500/15 to-cyan-400/10 text-primary-300 sm:flex"><Users className="h-5 w-5" /></span>
        <div>
          <h1 className="font-heading text-[26px] font-semibold tracking-tight text-surface-50 sm:text-[30px]">User management</h1>
          <p className="mt-1 text-[13px] text-surface-400">Manage laboratory staff, access roles, and platform permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SpotlightCard className="glass-card flex items-center justify-between rounded-xl p-4 sm:p-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400 sm:text-[11px]">Total staff</p><p className="mt-2 font-heading text-2xl font-semibold text-surface-50 tabular-nums">{users.length}</p></div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300"><Users className="h-5 w-5" /></span>
        </SpotlightCard>
        <SpotlightCard className="glass-card flex items-center justify-between rounded-xl p-4 sm:p-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400 sm:text-[11px]">Administrators</p><p className="mt-2 font-heading text-2xl font-semibold text-primary-300 tabular-nums">{totalAdmins}</p></div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300"><ShieldCheck className="h-5 w-5" /></span>
        </SpotlightCard>
        <SpotlightCard className="glass-card flex items-center justify-between rounded-xl p-4 sm:p-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400 sm:text-[11px]">Technicians</p><p className="mt-2 font-heading text-2xl font-semibold text-status-in-progress tabular-nums">{totalTechs}</p></div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-in-progress-bg text-status-in-progress"><FlaskConical className="h-5 w-5" /></span>
        </SpotlightCard>
        <SpotlightCard className="glass-card flex items-center justify-between rounded-xl p-4 sm:p-5">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400 sm:text-[11px]">Viewers</p><p className="mt-2 font-heading text-2xl font-semibold text-surface-200 tabular-nums">{totalViewers}</p></div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800 text-surface-300"><Eye className="h-5 w-5" /></span>
        </SpotlightCard>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-surface-900/55 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
          <Input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search name or email" className="ui-input-with-icon ui-input-with-clear" aria-label="Search users by name or email" />
          {searchQuery && <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-surface-500 transition hover:bg-surface-800 hover:text-surface-100"><X className="h-4 w-4" /></button>}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Filter users by role">
          {roleFilters.map((roleKey) => (
            <button
              key={roleKey}
              type="button"
              aria-pressed={selectedRoleFilter === roleKey}
              onClick={() => setSelectedRoleFilter(roleKey)}
              className={`min-h-9 shrink-0 rounded-lg px-3 text-xs font-semibold capitalize transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 ${selectedRoleFilter === roleKey ? 'border border-primary-400/25 bg-primary-500/15 text-primary-300' : 'border border-transparent text-surface-400 hover:bg-surface-800 hover:text-surface-200'}`}
            >{roleKey}</button>
          ))}
        </div>
      </div>

      <SpotlightCard className="glass-card overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5 sm:px-5">
          <div><h2 className="text-sm font-semibold text-surface-100">Team members</h2><p className="mt-0.5 text-xs text-surface-500">People with access to this laboratory</p></div>
          {!isLoading && <Badge tone="neutral" className="font-mono tabular-nums">{filteredUsers.length}</Badge>}
        </div>
        {isLoading ? (
          <div className="space-y-3 p-4 sm:p-5">{[1, 2, 3, 4].map(index => <Skeleton key={index} className="h-14 w-full rounded-lg" />)}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-800 text-surface-400"><Users className="h-5 w-5" /></span>
            <p className="text-sm font-semibold text-surface-200">No personnel found</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-surface-500">Try another search or choose a different role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-surface-850/70 text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                  <th scope="col" className="px-4 py-3.5 sm:px-5">User</th>
                  <th scope="col" className="px-4 py-3.5 sm:px-5">Role</th>
                  <th scope="col" className="px-4 py-3.5 sm:px-5">Registered</th>
                  <th scope="col" className="px-4 py-3.5 text-right sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-[13px]">
                {filteredUsers.map((user, rowIndex) => {
                  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
                  const isCurrentAccount = user._id === currentUser?._id;
                  const RoleIcon = roleConfig.icon;
                  return (
                    <motion.tr key={user._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16, delay: Math.min(rowIndex * 0.035, 0.21) }} onMouseEnter={() => setHoveredUserId(user._id)} onMouseLeave={() => setHoveredUserId(null)} onFocus={() => setHoveredUserId(user._id)} className="group transition-colors hover:bg-primary-500/[0.035] focus-within:bg-primary-500/[0.035]">
                      <td className="relative px-4 py-3.5 sm:px-5">
                        <AnimatePresence initial={false}>{hoveredUserId === user._id && <motion.span layoutId="users-row-highlight" initial={{ opacity: 0, scaleY: 0.5 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0.5 }} transition={{ duration: 0.16 }} className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-gradient-to-b from-primary-400 to-cyan-300" />}</AnimatePresence>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary-300/15 bg-gradient-to-br from-primary-500/20 to-cyan-500/10 text-xs font-bold text-primary-200">{user.name.charAt(0).toUpperCase()}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2"><span className="truncate font-semibold text-surface-100">{user.name}</span>{isCurrentAccount && <Badge tone="blue" className="min-h-5 px-1.5 py-0 text-[9px]"><UserCheck className="h-3 w-3" />You</Badge>}</div>
                            <span className="mt-0.5 block truncate font-mono text-[11px] text-surface-500">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 sm:px-5"><span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${roleConfig.color}`}><RoleIcon className="h-3.5 w-3.5" />{roleConfig.label}</span></td>
                      <td className="px-4 py-3.5 text-xs text-surface-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                      <td className="px-4 py-3.5 text-right sm:px-5">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" aria-label={`Edit ${user.name}`} onClick={() => handleOpenEdit(user)} className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 transition hover:bg-primary-500/10 hover:text-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500" title="Edit role or name"><Edit3 className="h-4 w-4" /></button>
                          <button type="button" aria-label={`Delete ${user.name}`} onClick={() => setDeletingUser(user)} disabled={isCurrentAccount} className={`flex h-9 w-9 items-center justify-center rounded-lg transition focus-visible:ring-2 focus-visible:ring-rose-500 ${isCurrentAccount ? 'cursor-not-allowed text-surface-600 opacity-40' : 'text-surface-400 hover:bg-status-rejected-bg hover:text-status-rejected'}`} title={isCurrentAccount ? 'Cannot delete your own active account' : 'Delete user'}><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SpotlightCard>

      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-5" onClick={() => !isUpdating && setEditingUser(null)}>
            <motion.section role="dialog" aria-modal="true" aria-labelledby="edit-user-title" initial={{ opacity: 0, y: 8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.99 }} transition={{ duration: 0.18 }} onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl border border-white/[0.09] bg-surface-900 p-5 shadow-2xl shadow-black/40 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                <div><h2 id="edit-user-title" className="font-heading text-lg font-semibold text-surface-50">Edit user</h2><p className="mt-1 text-xs text-surface-400">{editingUser.email}</p></div>
                <button type="button" aria-label="Close edit dialog" onClick={() => setEditingUser(null)} disabled={isUpdating} className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 transition hover:bg-surface-800 hover:text-surface-50 disabled:opacity-50"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleSaveEdit} className="space-y-5">
                <div className="space-y-2"><label htmlFor="edit-user-name" className="text-xs font-semibold text-surface-300">Full name</label><Input id="edit-user-name" type="text" value={editName} onChange={(event) => setEditName(event.target.value)} required minLength={2} maxLength={100} /></div>
                <fieldset className="space-y-2.5"><legend className="mb-2 text-xs font-semibold text-surface-300">Access role &amp; permissions</legend>
                  {(['admin', 'technician', 'viewer'] as const).map((role) => {
                    const config = ROLE_CONFIG[role];
                    const Icon = config.icon;
                    const isSelected = editRole === role;
                    return (
                      <button type="button" key={role} aria-pressed={isSelected} onClick={() => setEditRole(role)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 ${isSelected ? 'border-primary-400/30 bg-primary-500/[0.08]' : 'border-white/[0.07] bg-surface-850/50 hover:border-surface-600 hover:bg-surface-800/60'}`}>
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-primary-500/15 text-primary-300' : 'bg-surface-800 text-surface-400'}`}><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1"><span className={`flex items-center justify-between text-[13px] font-semibold ${isSelected ? 'text-primary-300' : 'text-surface-200'}`}>{config.label}{isSelected && <CheckCircle2 className="h-4 w-4" />}</span><span className="mt-1 block text-[11px] leading-4 text-surface-500">{config.description}</span></span>
                      </button>
                    );
                  })}
                </fieldset>
                <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] pt-4 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={() => setEditingUser(null)} disabled={isUpdating}>Cancel</Button>
                  <Button type="submit" disabled={isUpdating}>{isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}Save changes</Button>
                </div>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-5" onClick={() => !isDeleting && setDeletingUser(null)}>
            <motion.section role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title" initial={{ opacity: 0, y: 8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.99 }} transition={{ duration: 0.18 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-5 rounded-2xl border border-white/[0.09] bg-surface-900 p-5 shadow-2xl shadow-black/40 sm:p-6">
              <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-status-rejected/20 bg-status-rejected-bg text-status-rejected"><AlertTriangle className="h-5 w-5" /></span><div><h2 id="delete-user-title" className="font-heading text-base font-semibold text-surface-50">Delete user account?</h2><p className="mt-0.5 text-[11px] text-surface-500">This action is permanent and cannot be reversed.</p></div></div>
              <p className="text-[13px] leading-5 text-surface-300">Are you sure you want to delete <span className="font-semibold text-surface-100">{deletingUser.name}</span> (<span className="font-mono text-xs text-surface-400">{deletingUser.email}</span>)?</p>
              <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setDeletingUser(null)} disabled={isDeleting}>Cancel</Button>
                <Button type="button" variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>{isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}Delete account</Button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
