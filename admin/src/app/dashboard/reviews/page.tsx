'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { reviewService, ReviewItem } from '@/services/reviewService';
import { Star, Check, X, Trash2, RefreshCw, MessageSquare } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await reviewService.getReviews();
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await reviewService.updateStatus(id, status);
      loadReviews();
    } catch (err) {
      alert('Failed to update review status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.deleteReview(id);
      loadReviews();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Customer Review Moderation</h1>
        <p className="text-xs text-neutral-500">Approve, reject or moderate customer product ratings & feedback</p>
      </div>

      <Card title="Customer Reviews Queue">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-[#B38548] animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-50 rounded-xl border border-neutral-200">
            <MessageSquare className="w-10 h-10 text-neutral-400 mb-3" />
            <h3 className="text-sm font-bold text-neutral-900">No Reviews to Moderate</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Customer reviews will appear here for moderation once submitted.
            </p>
          </div>
        ) : (
          <div className="p-4 divide-y divide-neutral-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-current' : 'text-neutral-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-neutral-900">{rev.title || 'Product Review'}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rev.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed font-sans">{rev.comment}</p>

                  <div className="flex items-center space-x-4 text-[11px] text-neutral-400">
                    <span>Product: <strong className="text-neutral-700">{rev.product_name}</strong></span>
                    <span>Customer: <strong className="text-neutral-700">{rev.user_name}</strong></span>
                    <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {rev.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {rev.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs rounded-lg flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
