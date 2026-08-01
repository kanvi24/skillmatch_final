import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MessageSquare, Star, Trash2, Loader2, BarChart3 } from 'lucide-react';

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const nodeUrl = import.meta.env.VITE_NODE_API_URL || 'http://localhost:5001/api';

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-review-stats'],
    queryFn: async () => {
      const response = await axios.get(`${nodeUrl}/reviews/admin/stats`, authHeaders());
      return response.data;
    },
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-all-reviews'],
    queryFn: async () => {
      const response = await axios.get(`${nodeUrl}/reviews`, { params: { limit: 50 } });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`${nodeUrl}/reviews/admin/${id}`, authHeaders());
      return response.data;
    },
    onSuccess: () => {
      toast.success('Review removed.');
      queryClient.invalidateQueries({ queryKey: ['admin-all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.detail || 'Could not delete review. Is the Node service running?';
      toast.error(msg);
    },
  });

  const reviews = reviewsData?.reviews || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Review Moderation</h1>
        <p className="text-zinc-500 mt-1.5 text-xs max-w-2xl leading-relaxed">
          Served by the Node/Express microservice over Mongoose — separate from the Django API, sharing the same MongoDB database.
        </p>
      </div>

      {/* Per-company aggregate stats */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" /> Ratings by Company
        </h3>
        {statsLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        ) : !statsData?.perCompany?.length ? (
          <p className="text-xs text-zinc-500">No reviews submitted yet.</p>
        ) : (
          <div className="border border-zinc-800 rounded-xl divide-y divide-zinc-900 overflow-hidden">
            {statsData.perCompany.map((c) => (
              <div key={c._id} className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/40">
                <span className="text-xs text-zinc-200 font-medium">{c._id}</span>
                <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" /> {c.averageRating.toFixed(1)}
                  </span>
                  <span>{c.totalReviews} review{c.totalReviews !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual reviews, moderatable */}
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Recent Reviews ({statsData?.totalReviews ?? reviews.length})
        </h3>

        {reviewsLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950/20 border border-dashed border-zinc-850 rounded-xl">
            <p className="text-xs text-zinc-500">No reviews to moderate yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="vercel-card border border-zinc-800 rounded-xl p-4 bg-zinc-950/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white">{r.companyName}</span>
                      <span className="flex items-center gap-0.5 text-amber-400 text-[11px] font-semibold">
                        <Star className="w-3 h-3 fill-amber-400" /> {r.rating}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-200">{r.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{r.comment}</p>
                    <p className="text-[10px] text-zinc-600 mt-2">by {r.userName || r.userId}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Remove this review?')) {
                        deleteMutation.mutate(r._id);
                      }
                    }}
                    className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    title="Remove review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
