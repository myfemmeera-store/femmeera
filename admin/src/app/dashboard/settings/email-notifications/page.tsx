'use client';

import { useEffect, useState } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Server,
  ToggleLeft,
  ToggleRight,
  Save,
  HelpCircle,
} from 'lucide-react';
import { emailSettingsService, EmailSettingItem, SmtpConfigInfo } from '@/services/emailSettingsService';

export default function EmailNotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [customerSettings, setCustomerSettings] = useState<EmailSettingItem[]>([]);
  const [adminSettings, setAdminSettings] = useState<EmailSettingItem[]>([]);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfigInfo | null>(null);

  const [testEmailInput, setTestEmailInput] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const res = await emailSettingsService.getSettings();
      if (res.success && res.data) {
        setCustomerSettings(res.data.customer_notifications);
        setAdminSettings(res.data.admin_notifications);
        setSmtpConfig(res.data.smtp_config);
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to load email settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (id: number, type: 'customer' | 'admin') => {
    if (type === 'customer') {
      setCustomerSettings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_enabled: !item.is_enabled } : item))
      );
    } else {
      setAdminSettings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_enabled: !item.is_enabled } : item))
      );
    }
  };

  const handleSubjectChange = (id: number, type: 'customer' | 'admin', newSubject: string) => {
    if (type === 'customer') {
      setCustomerSettings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, subject_template: newSubject } : item))
      );
    } else {
      setAdminSettings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, subject_template: newSubject } : item))
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setAlertMsg(null);

    const allSettings = [...customerSettings, ...adminSettings].map((item) => ({
      id: item.id,
      is_enabled: item.is_enabled,
      subject_template: item.subject_template,
    }));

    try {
      const res = await emailSettingsService.updateSettings(allSettings);
      if (res.success) {
        setAlertMsg({ type: 'success', text: 'Email notification settings saved successfully!' });
      }
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      const res = await emailSettingsService.testConnection(testEmailInput.trim() || undefined);
      setTestResult({
        success: res.success,
        message: res.message || 'SMTP Connection test succeeded.',
        details: res.data?.details,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'SMTP connection test failed.',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-[#B38548]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-bold text-sm">Loading Email Notification Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EFE6D8] shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-[#B38548] mb-1">
            <Mail className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">System Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Email Notification Management</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure automated transactional email notifications, PHPMailer SMTP options, and event subjects.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#B38548] hover:bg-[#966C32] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer self-start md:self-auto"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'SAVING...' : 'SAVE ALL SETTINGS'}</span>
        </button>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-2 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* SMTP Connection Card & Diagnostics */}
      <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F5EDE0] pb-4">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-[#B38548]" />
            <div>
              <h2 className="font-bold text-sm text-neutral-900">PHPMailer SMTP Configuration</h2>
              <p className="text-[11px] text-neutral-500">Read directly from environment variables (.env)</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase rounded-full border border-emerald-200 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PHPMailer Engine Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-[#FAF4EB] p-4 rounded-2xl border border-[#E8DEC8]">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">SMTP Host</span>
            <span className="font-mono font-bold text-neutral-900 text-xs">{smtpConfig?.host || '127.0.0.1'}</span>
          </div>

          <div className="bg-[#FAF4EB] p-4 rounded-2xl border border-[#E8DEC8]">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">SMTP Port & Encryption</span>
            <span className="font-mono font-bold text-neutral-900 text-xs">
              {smtpConfig?.port} ({smtpConfig?.encryption.toUpperCase()})
            </span>
          </div>

          <div className="bg-[#FAF4EB] p-4 rounded-2xl border border-[#E8DEC8]">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Sender Email</span>
            <span className="font-bold text-neutral-900 text-xs truncate block">{smtpConfig?.from_address}</span>
          </div>

          <div className="bg-[#FAF4EB] p-4 rounded-2xl border border-[#E8DEC8]">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Sender Name</span>
            <span className="font-bold text-neutral-900 text-xs truncate block">{smtpConfig?.from_name}</span>
          </div>
        </div>

        {/* SMTP Test Form */}
        <form onSubmit={handleTestConnection} className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#E8DEC8] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-xs text-neutral-900">Run SMTP Diagnostic Test</h3>
              <p className="text-[11px] text-neutral-500">Send a live test email using PHPMailer to verify credentials.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                placeholder="test@example.com (optional)"
                className="px-3.5 py-2 bg-white border border-[#E8DEC8] rounded-xl text-xs flex-1 sm:w-64 focus:ring-2 focus:ring-[#B38548] focus:outline-none"
              />
              <button
                type="submit"
                disabled={testing}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shrink-0 cursor-pointer"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold mt-3 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{testResult.message}</span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Customer Notification Toggles */}
      <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F5EDE0] pb-4">
          <div>
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">Customer Notification Events ({customerSettings.length})</h2>
            <p className="text-[11px] text-neutral-500">Automated transactional emails dispatched to buyers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customerSettings.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl border border-[#EFE6D8] bg-[#FDFBF7] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xs text-neutral-900">{item.name}</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{item.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, 'customer')}
                  className="cursor-pointer text-2xl transition-transform active:scale-95 shrink-0"
                >
                  {item.is_enabled ? (
                    <ToggleRight className="w-8 h-8 text-[#B38548]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-neutral-300" />
                  )}
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={item.subject_template || ''}
                  onChange={(e) => handleSubjectChange(item.id, 'customer', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8DEC8] rounded-xl text-xs font-sans focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Alert Toggles */}
      <div className="bg-white rounded-3xl p-6 border border-[#EFE6D8] shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F5EDE0] pb-4">
          <div>
            <h2 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">Administrator Alert Events ({adminSettings.length})</h2>
            <p className="text-[11px] text-neutral-500">Internal operational alerts sent to business management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminSettings.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl border border-[#EFE6D8] bg-[#FDFBF7] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xs text-neutral-900">{item.name}</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{item.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, 'admin')}
                  className="cursor-pointer transition-transform active:scale-95 shrink-0"
                >
                  {item.is_enabled ? (
                    <ToggleRight className="w-8 h-8 text-[#B38548]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-neutral-300" />
                  )}
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Subject Template</label>
                <input
                  type="text"
                  value={item.subject_template || ''}
                  onChange={(e) => handleSubjectChange(item.id, 'admin', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8DEC8] rounded-xl text-xs font-sans focus:ring-2 focus:ring-[#B38548] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
