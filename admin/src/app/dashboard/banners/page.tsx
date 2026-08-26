'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Edit3, Trash2, Upload, RefreshCw, CheckCircle, AlertCircle, ArrowRight, Eye, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cmsService, HeroBanner } from '@/services/cmsService';
import { mediaService } from '@/services/mediaService';

export default function HeroBannersAdminPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  const [formData, setFormData] = useState<Partial<HeroBanner>>({
    title: '',
    subtitle: '',
    image_url: '',
    mobile_image_url: '',
    button_text: 'SHOP TRADITIONAL',
    button_url: '/women/traditional-wear',
    sort_order: 1,
    status: 'ACTIVE',
  });

  const [promoForm, setPromoForm] = useState({
    promo_banner_image: '/images/unlock_world_fashion_banner.jpg',
    promo_banner_url: '/women/western-wear',
    promo_banner_status: 'ACTIVE',
  });

  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBanners();
    loadPromoSettings();
  }, []);

  const loadPromoSettings = async () => {
    try {
      const res = await cmsService.getSettings();
      if (res.success && res.data) {
        setPromoForm({
          promo_banner_image: res.data.promo_banner_image || '/images/unlock_world_fashion_banner.jpg',
          promo_banner_url: res.data.promo_banner_url || '/women/western-wear',
          promo_banner_status: res.data.promo_banner_status || 'ACTIVE',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPromo(true);
    try {
      const res = await cmsService.updateSettings(promoForm);
      if (res.success) {
        setMessage({ type: 'success', text: 'Promotional Banner settings saved successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save promo settings' });
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handlePromoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPromo(true);
    try {
      const res = await mediaService.uploadImage(file, 'banners');
      if (res.success && res.data) {
        setPromoForm((prev) => ({ ...prev, promo_banner_image: res.data!.url }));
      }
    } catch (err) {
      alert('Promotional image upload failed');
    } finally {
      setIsUploadingPromo(false);
    }
  };

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const res = await cmsService.getBanners();
      if (res.success && res.data) {
        setBanners(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (banner?: HeroBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData(banner);
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        image_url: '',
        mobile_image_url: '',
        button_text: 'SHOP NOW',
        button_url: '/shop',
        sort_order: banners.length + 1,
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleDesktopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDesktop(true);
    try {
      const res = await mediaService.uploadImage(file, 'banners');
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          image_url: res.data!.url,
          mobile_image_url: prev.mobile_image_url || res.data!.url,
        }));
      }
    } catch (err) {
      alert('Desktop image upload failed');
    } finally {
      setIsUploadingDesktop(false);
    }
  };

  const handleMobileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMobile(true);
    try {
      const res = await mediaService.uploadImage(file, 'banners');
      if (res.success && res.data) {
        setFormData((prev) => ({ ...prev, mobile_image_url: res.data!.url }));
      }
    } catch (err) {
      alert('Mobile image upload failed');
    } finally {
      setIsUploadingMobile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      alert('Please upload a desktop hero image');
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (editingBanner?.id) {
        const res = await cmsService.updateBanner(editingBanner.id, formData);
        if (res.success) {
          setMessage({ type: 'success', text: 'Hero slide updated successfully!' });
        }
      } else {
        const res = await cmsService.createBanner(formData);
        if (res.success) {
          setMessage({ type: 'success', text: 'New hero slide created successfully!' });
        }
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;
    try {
      await cmsService.deleteBanner(id);
      loadBanners();
    } catch (err) {
      alert('Failed to delete hero slide');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Homepage Hero Banners & Slider
          </h1>
          <p className="text-xs text-neutral-500">
            Manage 100% full-width auto-scrolling hero banners and mobile optimized images
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hero Slide</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Configured Banners List */}
      <Card title="Active & Configured Hero Slides">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-6 h-6 text-[#B38548] animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center p-8 text-xs text-neutral-500">No hero banners configured yet.</div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="divide-y divide-neutral-100">
              {banners.map((b) => (
                <div key={b.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-28 h-16 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 shrink-0">
                      <Image
                        src={b.image_display_url || b.image_url}
                        alt={b.title || 'Slide'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{b.title || 'Untitled Slide'}</h4>
                      <p className="text-[11px] text-neutral-500">{b.subtitle || 'No subtitle'}</p>
                      <p className="text-[10px] text-[#B38548] font-mono mt-0.5">Link: {b.button_url}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                        b.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {b.status}
                    </span>
                    <button
                      onClick={() => handleOpenModal(b)}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit Slide"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => b.id && handleDelete(b.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Slide"
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

      {/* Mid-Page Promotional Banner Settings Card */}
      <Card title="Featured Mid-Page Promotional Banner" subtitle="Control image and click-through redirect URL for 'Unlock the world of fashion' banner">
        <form onSubmit={handleSavePromo} className="p-4 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            {/* Banner Preview */}
            <div className="relative w-full sm:w-64 aspect-[21/7] bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden shrink-0">
              <Image
                src={promoForm.promo_banner_image}
                alt="Promo Banner Preview"
                fill
                className="object-cover"
              />
            </div>

            {/* Inputs & Controls */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold border border-neutral-300 flex items-center space-x-2 shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingPromo ? 'Uploading New Banner...' : 'Upload New Banner Image'}</span>
                  <input type="file" accept="image/*" onChange={handlePromoImageUpload} className="hidden" />
                </label>
                <span className="text-[10px] text-neutral-400">Or paste image URL below</span>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={promoForm.promo_banner_image}
                  onChange={(e) => setPromoForm({ ...promoForm, promo_banner_image: e.target.value })}
                  placeholder="/images/unlock_world_fashion_banner.jpg"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Click-Through Redirect URL</label>
                <input
                  type="text"
                  value={promoForm.promo_banner_url}
                  onChange={(e) => setPromoForm({ ...promoForm, promo_banner_url: e.target.value })}
                  placeholder="/women/western-wear or /shop"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-neutral-700">Display Status:</label>
                  <select
                    value={promoForm.promo_banner_status}
                    onChange={(e) => setPromoForm({ ...promoForm, promo_banner_status: e.target.value })}
                    className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>

                <Button type="submit" disabled={isSavingPromo}>
                  {isSavingPromo ? 'Saving Settings...' : 'Save Promo Banner'}
                </Button>
              </div>
            </div>

          </div>
        </form>
      </Card>

      {/* Modal Form for Create / Edit Slide */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-base font-bold text-neutral-900">
                {editingBanner ? 'Edit Hero Slide' : 'Add New Hero Slide'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Input
                label="Slide Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Timeless Tradition"
                required
              />

              <Input
                label="Tagline / Subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Celebrate every moment in traditional attire"
              />

              {/* Desktop Image Upload */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 block">Desktop Hero Image (1920x800 recommended)</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <div className="relative w-24 h-14 border rounded-lg overflow-hidden shrink-0">
                      <Image src={formData.image_url} alt="Desktop Preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold border border-neutral-300 flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingDesktop ? 'Uploading Desktop Image...' : 'Choose Desktop Image'}</span>
                    <input type="file" accept="image/*" onChange={handleDesktopImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Mobile Image Upload */}
              <div className="space-y-1.5">
                <label className="font-bold text-neutral-700 block">Mobile Hero Image (768x900 recommended)</label>
                <div className="flex items-center gap-4">
                  {formData.mobile_image_url && (
                    <div className="relative w-16 h-20 border rounded-lg overflow-hidden shrink-0">
                      <Image src={formData.mobile_image_url} alt="Mobile Preview" fill className="object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold border border-neutral-300 flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingMobile ? 'Uploading Mobile Image...' : 'Choose Mobile Image'}</span>
                    <input type="file" accept="image/*" onChange={handleMobileImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Button Text"
                  value={formData.button_text || ''}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="SHOP TRADITIONAL"
                />
                <Input
                  label="Button Link URL"
                  value={formData.button_url || ''}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  placeholder="/women/traditional-wear"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Sort Order"
                  type="number"
                  value={formData.sort_order || 1}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                />
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700">Status</label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white text-xs font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
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
                  {isSaving ? 'Saving...' : 'Save Hero Slide'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
