'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Edit3, Trash2, Upload, RefreshCw, CheckCircle, AlertCircle, ArrowRight, Eye, X, Image as ImageIcon } from 'lucide-react';
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
    promo_banner_fit: 'cover',
  });

  // Shop By Category State
  const [shopCategories, setShopCategories] = useState<any[]>([
    { name: 'SAREES', subtitle: 'Grace in every drape', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop', slug: 'traditional-wear' },
    { name: 'SUITS', subtitle: 'Elegance redefined', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop', slug: 'traditional-wear' },
    { name: 'LEHENGAS', subtitle: 'Royal celebration wear', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop', slug: 'traditional-wear' },
    { name: 'KURTIS', subtitle: 'Everyday traditional comfort', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop', slug: 'traditional-wear' },
    { name: 'WESTERN DRESSES', subtitle: 'Chic modern trends', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', slug: 'western-wear' },
    { name: 'CO-ORD SETS', subtitle: 'Effortless style', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop', slug: 'western-wear' },
  ]);

  // Featured Collections State
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([
    { title: 'ROYAL TRADITIONAL WEAR', subtitle: 'Handcrafted Sarees, Lehengas & Anarkali Suits', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop', link: '/women/traditional-wear' },
    { title: 'CHIC WESTERN TRENDS', subtitle: 'Co-ords, Gowns, Dresses & Partywear', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', link: '/women/western-wear' },
    { title: 'FESTIVE SILKS', subtitle: 'Timeless Silk Sarees for Special Moments', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop', link: '/women/traditional-wear' },
    { title: 'ELEGANT EVENINGWEAR', subtitle: 'Statement Gowns & Luxe Cocktail Outfits', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop', link: '/women/western-wear' },
  ]);

  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [isUploadingPromo, setIsUploadingPromo] = useState(false);
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [isSavingShopCat, setIsSavingShopCat] = useState(false);
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);
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
          promo_banner_fit: res.data.promo_banner_fit || 'cover',
        });

        if (res.data.homepage_shop_categories && Array.isArray(res.data.homepage_shop_categories)) {
          setShopCategories(res.data.homepage_shop_categories);
        }
        if (res.data.homepage_featured_collections && Array.isArray(res.data.homepage_featured_collections)) {
          setFeaturedCollections(res.data.homepage_featured_collections);
        }
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

  const handleSaveShopCategories = async () => {
    setIsSavingShopCat(true);
    try {
      const res = await cmsService.updateSettings({
        homepage_shop_categories: JSON.stringify(shopCategories),
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Shop By Category section updated successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update Shop By Category' });
    } finally {
      setIsSavingShopCat(false);
    }
  };

  const handleSaveFeaturedCollections = async () => {
    setIsSavingFeatured(true);
    try {
      const res = await cmsService.updateSettings({
        homepage_featured_collections: JSON.stringify(featuredCollections),
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Featured Collections section updated successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update Featured Collections' });
    } finally {
      setIsSavingFeatured(false);
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

  const handleShopCatImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await mediaService.uploadImage(file, 'categories');
      if (res.success && res.data) {
        const updated = [...shopCategories];
        updated[index].image = res.data.url;
        setShopCategories(updated);
      }
    } catch (err) {
      alert('Image upload failed');
    }
  };

  const handleFeaturedImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await mediaService.uploadImage(file, 'banners');
      if (res.success && res.data) {
        const updated = [...featuredCollections];
        updated[index].image = res.data.url;
        setFeaturedCollections(updated);
      }
    } catch (err) {
      alert('Image upload failed');
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
            Homepage Banners & Section CMS
          </h1>
          <p className="text-xs text-neutral-500">
            Manage 100% full-width hero banners, circular Shop by Category cards, and Featured Collection cards
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

      {/* Configured Hero Banners List */}
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

      {/* SECTION 2: SHOP BY CATEGORY (CIRCULAR CARDS) MANAGER */}
      <Card title="Manage 'Shop By Category' Section" subtitle="Edit titles, subtitles, images, and category links for the circular homepage cards">
        <div className="p-4 space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopCategories.map((cat, idx) => (
              <div key={idx} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3 relative">
                <div className="flex items-center space-x-3">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-neutral-300 shrink-0 bg-neutral-200">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="font-bold text-neutral-800 block text-[10px] uppercase">Title</label>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => {
                        const updated = [...shopCategories];
                        updated[idx].name = e.target.value;
                        setShopCategories(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block text-[10px]">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={cat.subtitle}
                    onChange={(e) => {
                      const updated = [...shopCategories];
                      updated[idx].subtitle = e.target.value;
                      setShopCategories(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block text-[10px]">Category Slug / Link</label>
                  <input
                    type="text"
                    value={cat.slug}
                    onChange={(e) => {
                      const updated = [...shopCategories];
                      updated[idx].slug = e.target.value;
                      setShopCategories(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block text-[10px]">Image Framing / Fit in Frame</label>
                  <select
                    value={cat.fit || 'cover'}
                    onChange={(e) => {
                      const updated = [...shopCategories];
                      updated[idx].fit = e.target.value;
                      setShopCategories(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="cover">Fill Frame (Standard Crop)</option>
                    <option value="contain">Fit Entire Image (No Crop)</option>
                    <option value="top">Top Focus (Show Upper Body / Face)</option>
                    <option value="bottom">Bottom Focus (Show Dress Hem)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block text-[10px]">Image URL or Upload</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cat.image}
                      onChange={(e) => {
                        const updated = [...shopCategories];
                        updated[idx].image = e.target.value;
                        setShopCategories(updated);
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-neutral-300 rounded-lg text-[10px] font-mono"
                    />
                    <label className="cursor-pointer px-2.5 py-1.5 bg-white hover:bg-neutral-100 border rounded-lg font-bold text-[10px] shrink-0">
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => handleShopCatImageUpload(idx, e)} className="hidden" />
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated = shopCategories.filter((_, i) => i !== idx);
                    setShopCategories(updated);
                  }}
                  className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-rose-600 rounded-full"
                  title="Remove Item"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShopCategories([
                  ...shopCategories,
                  { name: 'NEW CATEGORY', subtitle: 'Collection tagline', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop', slug: 'traditional-wear', fit: 'cover' },
                ]);
              }}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold rounded-xl flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category Card</span>
            </button>

            <Button onClick={handleSaveShopCategories} disabled={isSavingShopCat}>
              {isSavingShopCat ? 'Saving Categories...' : 'Save Shop By Category Section'}
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 3: FEATURED COLLECTIONS MANAGER */}
      <Card title="Manage 'Featured Collections' Section" subtitle="Edit titles, descriptions, images, framing options, and links for the rectangular collection cards">
        <div className="p-4 space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredCollections.map((col, idx) => (
              <div key={idx} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3 relative flex gap-4">
                <div className="relative w-28 h-40 bg-neutral-900 rounded-xl overflow-hidden shrink-0 border">
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    className={
                      col.fit === 'contain'
                        ? 'object-contain p-1 bg-neutral-900'
                        : col.fit === 'top'
                        ? 'object-cover object-top'
                        : col.fit === 'bottom'
                        ? 'object-cover object-bottom'
                        : 'object-cover'
                    }
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <label className="font-bold text-neutral-800 block text-[10px] uppercase">Title</label>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => {
                        const updated = [...featuredCollections];
                        updated[idx].title = e.target.value;
                        setFeaturedCollections(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block text-[10px]">Subtitle</label>
                    <input
                      type="text"
                      value={col.subtitle}
                      onChange={(e) => {
                        const updated = [...featuredCollections];
                        updated[idx].subtitle = e.target.value;
                        setFeaturedCollections(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block text-[10px]">Redirect Link URL</label>
                    <input
                      type="text"
                      value={col.link}
                      onChange={(e) => {
                        const updated = [...featuredCollections];
                        updated[idx].link = e.target.value;
                        setFeaturedCollections(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block text-[10px]">Image Framing / Fit in Frame</label>
                    <select
                      value={col.fit || 'cover'}
                      onChange={(e) => {
                        const updated = [...featuredCollections];
                        updated[idx].fit = e.target.value;
                        setFeaturedCollections(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-white"
                    >
                      <option value="cover">Fill Frame (Standard Crop)</option>
                      <option value="contain">Fit Entire Image (No Crop)</option>
                      <option value="top">Top Focus (Show Upper Body / Face)</option>
                      <option value="bottom">Bottom Focus (Show Dress Hem)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block text-[10px]">Image URL or Upload</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={col.image}
                        onChange={(e) => {
                          const updated = [...featuredCollections];
                          updated[idx].image = e.target.value;
                          setFeaturedCollections(updated);
                        }}
                        className="flex-1 px-2 py-1 border border-neutral-300 rounded-lg text-[10px] font-mono"
                      />
                      <label className="cursor-pointer px-2 py-1 bg-white hover:bg-neutral-100 border rounded-lg font-bold text-[10px] shrink-0">
                        Upload
                        <input type="file" accept="image/*" onChange={(e) => handleFeaturedImageUpload(idx, e)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated = featuredCollections.filter((_, i) => i !== idx);
                    setFeaturedCollections(updated);
                  }}
                  className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-rose-600 rounded-full"
                  title="Remove Card"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setFeaturedCollections([
                  ...featuredCollections,
                  { title: 'NEW COLLECTION', subtitle: 'Collection description', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop', link: '/women/traditional-wear' },
                ]);
              }}
              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold rounded-xl flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Collection Card</span>
            </button>

            <Button onClick={handleSaveFeaturedCollections} disabled={isSavingFeatured}>
              {isSavingFeatured ? 'Saving Featured Collections...' : 'Save Featured Collections Section'}
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 4: MID-PAGE PROMOTIONAL BANNER */}
      <Card title="Featured Mid-Page Promotional Banner" subtitle="Control image, framing fit, and click-through redirect URL for 'Unlock the world of fashion' banner">
        <form onSubmit={handleSavePromo} className="p-4 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            {/* Banner Preview */}
            <div className="relative w-full sm:w-64 aspect-[21/7] bg-neutral-900 border border-neutral-200 rounded-xl overflow-hidden shrink-0">
              <Image
                src={promoForm.promo_banner_image}
                alt="Promo Banner Preview"
                fill
                className={
                  promoForm.promo_banner_fit === 'contain'
                    ? 'object-contain bg-neutral-900'
                    : promoForm.promo_banner_fit === 'top'
                    ? 'object-cover object-top'
                    : promoForm.promo_banner_fit === 'bottom'
                    ? 'object-cover object-bottom'
                    : 'object-cover'
                }
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
                <label className="font-bold text-neutral-700 block mb-1">Image Framing / Fit in Frame</label>
                <select
                  value={promoForm.promo_banner_fit}
                  onChange={(e) => setPromoForm({ ...promoForm, promo_banner_fit: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-black font-bold text-xs bg-white"
                >
                  <option value="cover">Fill Frame (Standard Crop)</option>
                  <option value="contain">Fit Entire Image (No Crop)</option>
                  <option value="top">Top Focus (Show Upper Body / Face)</option>
                  <option value="bottom">Bottom Focus (Show Dress Hem)</option>
                </select>
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
