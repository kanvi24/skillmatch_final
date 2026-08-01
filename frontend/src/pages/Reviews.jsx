import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MessageSquareText, Star, Loader2, Plus, X, Trash2 } from 'lucide-react';

export default function Reviews() {
  const queryClient = useQueryClient();
  // Separate base URL for the Node/Express/Mongoose microservice
  const nodeUrl = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5001/api';
  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [companyFilter, setCompanyFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    rating: 5,
    title: '',
    comment: '',
    pros: '',
    cons: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', companyFilter],
    queryFn: async () => {
      const res = await axios.get(`${nodeUrl}/reviews`, {
        params: companyFilter ? { company: companyFilter } : {},
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(`${nodeUrl}/reviews`, payload, authHeaders);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Review posted!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowModal(false);
      setForm({ companyName: '', rating: 5, title: '', comment: '', pros: '', cons: '' });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.detail || 'Could not post review. Is the Node service running?');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${nodeUrl}/reviews/${id}`, authHeaders);
    },
    onSuccess: () => {
      toast.success('Review deleted.');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: () => toast.error('Could not delete review.'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.companyName || !form.title || !form.comment) return;
    createMutation.mutate(form);
  };

  const reviews = data?.reviews || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-6 border-b border-zinc-900">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquareText className="w-7 h-7 text-purple-400" /> Company Reviews
          </h1>
          <p className="text-zinc-500 mt-1.5 text-xs max-w-2xl leading-relaxed">
            Served by a standalone Node.js + Express + Mongoose microservice,
            sharing the same MongoDB database and JWT login as the rest of
            SkillMatch.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="vercel-btn-primary px-4 py-2.5 text-xs flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Write a Review
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by company name..."
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="block w-full sm:w-80 px-3.5 py-2 bg-black border border-zinc-800 focus:border-zinc-500 rounded-lg text-white placeholder-zinc-700 text-xs focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mx-auto mb-4" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-zinc-500">
          No reviews yet. Make sure the Node service is running (`npm start` in{' '}
          <code>node-service/</code>) and be the first to post one.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{r.title}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
                    {r.companyName} · {r.userName}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5"
                      fill={i < r.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed">{r.comment}</p>
              {(r.pros || r.cons) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {r.pros && (
                    <p className="text-[11px] text-emerald-400">
                      <strong className="uppercase tracking-wider text-[9px] block text-zinc-500 mb-0.5">
                        Pros
                      </strong>
                      {r.pros}
                    </p>
                  )}
                  {r.cons && (
                    <p className="text-[11px] text-red-400">
                      <strong className="uppercase tracking-wider text-[9px] block text-zinc-500 mb-0.5">
                        Cons
                      </strong>
                      {r.cons}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={() => deleteMutation.mutate(r._id)}
                className="mt-3 text-[10px] text-zinc-600 hover:text-red-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white mb-6">Write a Company Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Rating
                </label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Star{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Comment
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  rows={3}
                  className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Pros
                  </label>
                  <input
                    type="text"
                    value={form.pros}
                    onChange={(e) => setForm({ ...form, pros: e.target.value })}
                    className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Cons
                  </label>
                  <input
                    type="text"
                    value={form.cons}
                    onChange={(e) => setForm({ ...form, cons: e.target.value })}
                    className="block w-full px-3.5 py-2.5 bg-black border border-zinc-800 focus:border-white rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="vercel-btn-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="vercel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Post Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
