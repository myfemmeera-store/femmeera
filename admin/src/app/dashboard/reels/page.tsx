'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { reelService } from '@/services/reelService';
import { mediaService } from '@/services/mediaService';
import { WatchAndShopReel } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit3, Trash2, Video, ExternalLink, Upload, Film, Play, Sparkles } from 'lucide-react';

export default function WatchAndShopAdminPage() {
  const { showToast } = useToast();

  const [reels, setReels] = useState<WatchAndShopReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<WatchAndShopReel | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    video_url: '',
    product_url: '',
    button_text: 'View Product',
    sort_order: '1',
    status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const loadReels = async () => {
    setIsLoading(true);
    try {
      const res = await reelService.getReels();
      if (res.success && res.data) {
        setReels(res.data);
      }
    } catch (err) {
      showToast('Failed to load Watch & Shop reels.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReels();
  }, []);

  const handleOpenAddModal = () => {
    setEditingReel(null);
    setFormData({
      title: '',
      video_url: '',
      product_url: '',
      button_text: 'View Product',
      sort_order: String(reels.length + 1),
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (reel: WatchAndShopReel) => {
    setEditingReel(reel);
    setFormData({
      title: reel.title,
      video_url: reel.video_url,
      product_url: reel.product_url,
      button_text: reel.button_text || 'View Product',
      sort_order: String(reel.sort_order),
      status: reel.status,
    });
    setModalOpen(true);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsUploadingVideo(true);
    try {
      const res = await mediaService.uploadImage(file, 'reels');
      if (res.success && res.data) {
        setFormData((prev) => ({ ...prev, video_url: res.data!.url }));
        showToast('Watch & Shop video reel uploaded successfully!', 'success');
      } else {
        showToast(res.message || 'Video upload failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Video upload failed.', 'error');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url || !formData.product_url) {
      showToast('Title, Video, and Product URL are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<WatchAndShopReel> = {
        title: formData.title,
        video_url: formData.video_url,
        poster_url: null,
        product_url: formData.product_url,
        button_text: formData.button_text,
        sort_order: parseInt(formData.sort_order, 10) || 0,
        status: formData.status,
      };

      if (editingReel) {
        const res = await reelService.updateReel(editingReel.id, payload);
        if (res.success) {
          showToast('Reel updated successfully.', 'success');
          setModalOpen(false);
          loadReels();
        } else {
          showToast(res.message || 'Update failed.', 'error');
        }
      } else {
        const res = await reelService.createReel(payload);
        if (res.success) {
          showToast('New Watch & Shop reel created.', 'success');
          setModalOpen(false);
          loadReels();
        } else {
          showToast(res.message || 'Creation failed.', 'error');
        }
      }
    } catch (err) {
      showToast('Error saving reel.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this Watch & Shop reel?')) return;

    try {
      const res = await reelService.deleteReel(id);
      if (res.success) {
        showToast('Reel removed successfully.', 'success');
        loadReels();
      }
    } catch (err) {
      showToast('Failed to delete reel.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-rose-600" />
            Watch &amp; Shop (9:16 Video Reels)
          </h1>
          <p className="text-xs text-neutral-500">
            Upload and manage local 9:16 fashion reel videos with direct &quot;View Product&quot; links for the storefront.
          </p>
        </div>

        <Button onClick={handleOpenAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New 9:16 Reel
        </Button>
      </div>

      {/* Main Grid */}
      <Card title="Homepage Watch & Shop Video Reels">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 py-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-9/16 w-full rounded-2xl" />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Video className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">No Watch &amp; Shop Reels Created Yet</p>
            <Button size="sm" onClick={handleOpenAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Create First Reel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="group relative bg-neutral-900 rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-200 shadow-md flex flex-col justify-between"
              >
                {/* 9:16 Aspect Ratio Video Preview Box */}
                <div className="relative aspect-9/16 w-full bg-black overflow-hidden group">
                  <video
                    src={reel.video_display_url || (reel.video_url?.startsWith('http') ? reel.video_url : `http://localhost:8000/storage/${reel.video_url?.replace(/^\/?storage\//, '').replace(/^\//, '')}`)}
                    controls
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 scale-90 sm:scale-100 origin-top-left">
                    <Badge variant={reel.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {reel.status}
                    </Badge>
                  </div>

                  {/* Sort Order Badge */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-black/70 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full border border-white/20">
                    #{reel.sort_order}
                  </div>

                  {/* MOBILE ONLY: Beautiful Floating Action Overlay Bar (Edit & Delete) */}
                  <div className="flex sm:hidden absolute bottom-3 right-3 z-20 items-center gap-2 bg-black/65 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-lg">
                    <button
                      onClick={() => handleOpenEditModal(reel)}
                      title="Edit Reel"
                      className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(reel.id)}
                      title="Delete Reel"
                      className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info & Action Section */}
                <div className="p-2 sm:p-3.5 bg-white border-t border-neutral-100 space-y-1.5 sm:space-y-2 text-xs">
                  <h4 className="font-bold text-neutral-900 text-[11px] sm:text-xs line-clamp-1">{reel.title}</h4>
                  
                  <div className="flex items-center text-[10px] sm:text-[11px] text-neutral-500 gap-1 truncate">
                    <ExternalLink className="w-3 h-3 shrink-0 text-neutral-400" />
                    <span className="truncate">{reel.product_url}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-neutral-100">
                    <span className="text-[9px] sm:text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded truncate">
                      {reel.button_text || 'View Product'}
                    </span>

                    {/* DESKTOP ONLY: Standard Edit & Delete buttons */}
                    <div className="hidden sm:flex items-center space-x-1.5">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(reel)} className="!p-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(reel.id)} className="!p-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingReel ? 'Edit Watch & Shop Reel' : 'Add New 9:16 Video Reel'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Reel Title"
            placeholder="e.g., Royal Bridal Silk Lehenga Look"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          {/* Upload Video File (Local Storage) */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-700">Upload Video File (MP4, WebM, MOV)</label>
            <div className="space-y-2">
              <label className="border-2 border-dashed border-neutral-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black transition-colors bg-neutral-50">
                <Upload className="w-6 h-6 text-neutral-400 mb-1" />
                <span className="text-xs font-bold text-neutral-800">
                  {isUploadingVideo ? 'Uploading Video to Local Storage...' : 'Click to Upload Video File'}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">MP4, WEBM, MOV, M4V (Max 100MB)</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isUploadingVideo}
                  className="hidden"
                />
              </label>

              {formData.video_url && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold truncate flex items-center justify-between">
                  <span className="truncate">Selected: {formData.video_url}</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded ml-2">READY</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Link URL */}
          <Input
            label="Product Page URL"
            placeholder="e.g., /product/embroidered-silk-lehenga-set"
            value={formData.product_url}
            onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Button Text"
              value={formData.button_text}
              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
            />

            <Input
              label="Sort Order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
            />

            <Select
              label="Status"
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'DISABLED', label: 'Disabled' },
              ]}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'DISABLED' })}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}>
              {editingReel ? 'Save Reel Changes' : 'Create 9:16 Reel'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
