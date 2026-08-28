import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Femmeera',
  description: "Read Femmeera's privacy policy regarding how we collect, use, protect and handle customer personal data and order details.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#B38548] gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="border-b border-[#EFE6D8] pb-8">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#B38548] uppercase block mb-1">
            DATA PROTECTION & TRUST
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-neutral-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Last Updated: August 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Highlight Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
            <Lock className="w-5 h-5 text-[#B38548]" />
            <h4 className="font-bold text-neutral-900">256-Bit SSL Encryption</h4>
            <p className="text-neutral-500">Your personal details and checkout data are encrypted and protected.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#B38548]" />
            <h4 className="font-bold text-neutral-900">No Payment Storage</h4>
            <p className="text-neutral-500">Card numbers and UPI IDs are processed directly by RBI-registered gateways.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EFE6D8] space-y-2">
            <FileText className="w-5 h-5 text-[#B38548]" />
            <h4 className="font-bold text-neutral-900">Zero Data Selling</h4>
            <p className="text-neutral-500">We strictly never sell, trade, or rent your personal contact information.</p>
          </div>
        </div>

        {/* Policy Body Content */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-8 text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans">
          
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-neutral-900 border-b border-[#F5EFE6] pb-2">
              1. Information We Collect
            </h2>
            <p>
              When you browse our online store, register an account, or make a purchase, Femmeera collects necessary information to complete your order:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-2">
              <li>Full Name, Email Address, and Contact Mobile Number</li>
              <li>Shipping & Billing Postal Addresses</li>
              <li>Order History and Saved Wishlist Items</li>
              <li>IP Address, Browser Type, and Device Diagnostics for fraud prevention</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-neutral-900 border-b border-[#F5EFE6] pb-2">
              2. How We Use Your Information
            </h2>
            <p>
              Your personal information is strictly used for legitimate e-commerce operations:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-2">
              <li>Processing, fulfilling, and delivering your online fashion orders</li>
              <li>Sending order confirmation emails, shipment dispatch alerts, and invoice updates</li>
              <li>Providing customer support regarding returns, refunds, or product queries</li>
              <li>Improving our website performance, user experience, and catalog recommendations</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-neutral-900 border-b border-[#F5EFE6] pb-2">
              3. Data Protection & Security
            </h2>
            <p>
              Femmeera implements industry-standard technical and organizational security measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-neutral-900 border-b border-[#F5EFE6] pb-2">
              4. Cookies & Analytics
            </h2>
            <p>
              We use small data files called cookies to keep track of your shopping cart, remember your login preferences, and analyze web traffic metrics to enhance website performance.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-neutral-900 border-b border-[#F5EFE6] pb-2">
              5. Contact Us Regarding Privacy
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data rights, please contact us at:
            </p>
            <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#EFE6D8] font-mono text-xs text-neutral-900">
              Email: myfemmeera@gmail.com
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
