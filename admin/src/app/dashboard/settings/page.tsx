'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { settingService, SystemSettings } from '@/services/settingService';
import { mediaService } from '@/services/mediaService';
import { Settings, Upload, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    store_name: 'Femmeera',
    store_logo: '',
    store_email: 'hello@femmeera.com',
    store_phone: '+91 98765 43210',
    store_address: 'Bangalore, India',
    store_currency: 'INR',
    currency_symbol: '₹',
    free_shipping_threshold: '1499',
    announcement_bar: 'Free Shipping on Orders above ₹1499 | COD Available',
    default_meta_title: "Femmeera | Premium Women's Traditional & Western Wear",
    default_meta_description: 'Discover handcrafted traditional sarees & chic western trends.',
    social_instagram: 'https://instagram.com',
    social_facebook: 'https://facebook.com',
    social_whatsapp: 'https://wa.me/919876543210',
    social_youtube: 'https://youtube.com',
    social_pinterest: 'https://pinterest.com',
    social_twitter: 'https://x.com',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await settingService.getSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setMessage(null);

    try {
      const res = await mediaService.uploadImage(file, 'branding');
      if (res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          store_logo: res.data!.url,
        }));
        setMessage({ type: 'success', text: 'Logo uploaded successfully. Click Save Settings to persist.' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to upload logo.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Logo upload failed.' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await settingService.updateSettings(settings);
      if (res.success) {
        setMessage({ type: 'success', text: 'Store settings and logo saved successfully to database!' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to save settings.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Save failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#B38548] animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Store Branding & Settings</h1>
          <p className="text-xs text-neutral-500">Manage dynamic logo, business info, announcement bar & SEO</p>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Brand Logo Card */}
      <Card title="Website Logo & Branding">
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            Upload the official store logo. The logo will automatically update across the Storefront Header, Mobile Navigation Drawer, Footer, and Admin Portal.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
            <div className="w-48 h-20 bg-white border border-neutral-200 rounded-lg flex items-center justify-center p-2 relative overflow-hidden shrink-0">
              {settings.store_logo ? (
                <Image
                  src={settings.store_logo}
                  alt="Store Logo"
                  width={180}
                  height={60}
                  className="max-h-full w-auto object-contain"
                />
              ) : (
                <div className="text-center text-neutral-400 text-xs flex flex-col items-center">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span>No logo set</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors">
                <Upload className="w-4 h-4" />
                <span>{isUploadingLogo ? 'Uploading Logo...' : 'Upload / Replace Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-neutral-400">Supported formats: PNG, WEBP, SVG, JPG (Max 5MB)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* General Store Info */}
      <Card title="General Store Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Store Name"
            value={settings.store_name || ''}
            onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
            required
          />
          <Input
            label="Contact Email"
            type="email"
            value={settings.store_email || ''}
            onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
            required
          />
          <Input
            label="Contact Phone"
            value={settings.store_phone || ''}
            onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
          />
          <Input
            label="Store Location"
            value={settings.store_address || ''}
            onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
          />
          <Input
            label="Currency Symbol"
            value={settings.currency_symbol || ''}
            onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
          />
          <Input
            label="Currency Code"
            value={settings.store_currency || ''}
            onChange={(e) => setSettings({ ...settings, store_currency: e.target.value })}
          />
        </div>
      </Card>

      {/* Announcement Bar & Shipping Threshold */}
      <Card title="Announcement Bar & Shipping Rules">
        <div className="space-y-4">
          <Input
            label="Top Announcement Bar Text"
            value={settings.announcement_bar || ''}
            onChange={(e) => setSettings({ ...settings, announcement_bar: e.target.value })}
            placeholder="e.g. Free Shipping on Orders above ₹1499"
          />
          <Input
            label="Free Shipping Threshold (₹)"
            type="number"
            value={settings.free_shipping_threshold || ''}
            onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
          />
        </div>
      </Card>

      {/* Social Media Links */}
      <Card title="Social Media Profiles & Channels">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Instagram Profile URL"
            value={settings.social_instagram || ''}
            onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
            placeholder="https://instagram.com/femmeera_official"
          />
          <Input
            label="Facebook Page URL"
            value={settings.social_facebook || ''}
            onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
            placeholder="https://facebook.com/femmeerastore"
          />
          <Input
            label="WhatsApp Link / Business Number"
            value={settings.social_whatsapp || ''}
            onChange={(e) => setSettings({ ...settings, social_whatsapp: e.target.value })}
            placeholder="https://wa.me/919876543210"
          />
          <Input
            label="YouTube Channel URL"
            value={settings.social_youtube || ''}
            onChange={(e) => setSettings({ ...settings, social_youtube: e.target.value })}
            placeholder="https://youtube.com/@femmeera"
          />
          <Input
            label="Pinterest Profile URL"
            value={settings.social_pinterest || ''}
            onChange={(e) => setSettings({ ...settings, social_pinterest: e.target.value })}
            placeholder="https://pinterest.com/femmeera"
          />
          <Input
            label="Twitter / X Profile URL"
            value={settings.social_twitter || ''}
            onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
            placeholder="https://x.com/femmeera"
          />
        </div>
      </Card>

      {/* SEO Tags */}
      <Card title="Default Search Engine Optimization (SEO)">
        <div className="space-y-4">
          <Input
            label="Default Meta Title"
            value={settings.default_meta_title || ''}
            onChange={(e) => setSettings({ ...settings, default_meta_title: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700">Default Meta Description</label>
            <textarea
              rows={3}
              value={settings.default_meta_description || ''}
              onChange={(e) => setSettings({ ...settings, default_meta_description: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="px-8 py-3">
          {isSaving ? 'Saving Changes...' : 'Save All Settings'}
        </Button>
      </div>
    </form>
  );
}
