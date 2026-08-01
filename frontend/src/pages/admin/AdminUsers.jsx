import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { Users, ShieldCheck, ShieldOff, Trash2, Loader2 } from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/auth/admin/users`, authHeaders());
      return response.data;
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const response = await axios.patch(`${backendUrl}/auth/admin/users/${id}/role`, { role }, authHeaders());
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.email} is now ${data.role}.`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Could not update role.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${backendUrl}/auth/admin/users/${id}`, authHeaders());
      return response.data;
    },
    onSuccess: () => {
      toast.success('User deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Could not delete user.'),
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">User Management</h1>
        <p className="text-zinc-500 mt-1.5 text-xs max-w-2xl leading-relaxed">
          Promote trusted users to admin, or revoke access. You can't change your own admin status here — sign in as another admin to do that.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto" />
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 border-b border-zinc-900">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email</th>
                <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                <th className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u.id} className="bg-zinc-950/40">
                    <td className="px-4 py-3 text-xs text-white font-medium">
                      {u.name} {isSelf && <span className="text-zinc-600">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          isAdmin
                            ? 'bg-purple-950/40 border-purple-800/40 text-purple-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          disabled={isSelf || roleMutation.isPending}
                          onClick={() => roleMutation.mutate({ id: u.id, role: isAdmin ? 'user' : 'admin' })}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-855 border border-zinc-800 px-2.5 py-1 rounded cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {isAdmin ? (
                            <>
                              <ShieldOff className="w-3 h-3" /> Demote
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3" /> Promote
                            </>
                          )}
                        </button>
                        <button
                          disabled={isSelf || deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`Delete ${u.email}? This can't be undone.`)) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                          className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
  );
}
