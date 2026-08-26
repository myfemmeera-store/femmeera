'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cmsService, PopupItem } from '@/services/cmsService';
import { mediaService } from '@/services/mediaService';
import { Sparkles, Upload, RefreshCw, CheckCircle, AlertCircle, Trash2, Edit3, Plus, X } from 'lucide-react';
import Image from 'next/image';

export default function CMSPage() {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupItem | null>(null);

  const [formData, setFormData] = useState<Partial<PopupItem>>({
    title: '',
    description: '',
    image_url: '',
    button_text: 'CLAIM NOW',
    button_url: '/shop',
    coupon_code: 'FEMMEERA10',
    status: 'ACTIVE',
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    setIsLoading(true);
    try {
      const res = await cmsService.getPopups();
      if (res.success && res.data) {
        setPopups(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (popup?: PopupItem) => {
    if (popup) {
      setEditingPopup(popup);
      setFormData(popup);
    } else {
      setEditingPopup(null);
      setFormData({
        title: 'WELCOME TO FEMMEERA',
        description: 'Get 10% OFF on your first purchase!',
        image_url: '',
        button_text: 'CLAIM 10% OFF',
        button_url: '/shop',
        coupon_code: 'WELCOME10',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await mediaService.uploadImage(file, 'cms');
      if (res.success && res.data) {
        setFormData((prev) => ({ ...prev, image_url: res.data!.url }));
      }
    } catch (err) {
      alert('Popup image upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingPopup?.id) {
        await cmsService.updatePopup(editingPopup.id, formData);
      } else {
        await cmsService.createPopup(formData);
      }
      setIsModalOpen(false);
      loadPopups();
    } catch (err) {
      alert('Failed to save popup');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this promotional popup?')) return;
    try {
      await cmsService.deletePopup(id);
      loadPopups();
    } catch (err) {
      alert('Failed to delete popup');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Promotional Popups & CMS Modals
          </h1>
          <p className="text-xs text-neutral-500">
            Configure offer popups, discount coupon banners, and lead capture modals
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Popup</span>
        </button>
      </div>

      <Card title="Configured Promotional Popups">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-[#B38548] animate-spin" />
          </div>
        ) : popups.length === 0 ? (
          <div className="text-center p-8 text-xs text-neutral-500">No popups created yet.</div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="divide-y divide-neutral-100">
              {popups.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    {p.image_url ? (
                      <div className="relative w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 shrink-0">
                        <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{p.title}</h4>
                      <p className="text-[11px] text-neutral-500">{p.description}</p>
                      {p.coupon_code && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-neutral-100 border border-neutral-300 font-mono text-[10px] font-bold rounded">
                          COUPON: {p.coupon_code}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {p.status}
                    </span>
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => p.id && handleDelete(p.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Create / Edit Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-base font-bold text-neutral-900">
                {editingPopup ? 'Edit Popup' : 'Create New Popup'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input
                label="Popup Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black text-xs"
                />
              </div>

              {/* Popup Banner Image */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 block">Popup Banner Image</label>
                <div className="flex items-center gap-3">
                  {formData.image_url && (
                    <div className="relative w-16 h-16 rounded border overflow-hidden shrink-0">
                      <Image src={formData.image_url} alt="Popup preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer px-3 py-2 bg-neutral-100 hover:bg-neutral-200 border rounded-xl font-bold flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingImage ? 'Uploading Image...' : 'Choose Image'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Coupon Code"
                  value={formData.coupon_code || ''}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                />
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Status</label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Button Text"
                  value={formData.button_text || ''}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                />
                <Input
                  label="Button Link URL"
                  value={formData.button_url || ''}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold text-neutral-700"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Popup'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
