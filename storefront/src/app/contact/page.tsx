import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Mail, Globe, HeadphoneOff, MessageSquare, Package, Truck, RotateCcw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Femmeera | Customer Support',
  description: "Contact Femmeera for help with orders, products, shipping, returns, payments and other customer enquiries.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#B38548] gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-3 border-b border-[#EFE6D8] pb-8">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#B38548] uppercase">
            GET IN TOUCH
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-neutral-900">
            Contact Femmeera
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            We're here to help. Whether you have a question about a product, need assistance with an order, or want to know more about shipping and returns, our team is happy to assist you.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] text-[#B38548] flex items-center justify-center border border-[#EFE5D5]">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-neutral-900">Email Support</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Send us an email anytime and we will respond within 24 business hours. Please include your order number for faster resolution.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="mailto:myfemmeera@gmail.com"
                className="inline-flex items-center text-sm font-bold text-[#B38548] hover:underline"
              >
                myfemmeera@gmail.com
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF4EB] text-[#B38548] flex items-center justify-center border border-[#EFE5D5]">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium text-neutral-900">Official Store</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Visit our official online store to browse collections, track orders, or manage your account profile.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-sm font-bold text-neutral-900">Femmeera.com</span>
            </div>
          </div>
        </div>

        {/* How Can We Help Grid */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-6">
          <h2 className="font-serif text-2xl font-medium text-neutral-900 text-center border-b border-[#F5EFE6] pb-4">
            How Can We Help?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-[#FAF6F0] space-y-2 border border-[#EFE6D8]">
              <div className="flex items-center space-x-2 font-bold text-neutral-900 text-sm">
                <Package className="w-4 h-4 text-[#B38548]" />
                <span>Order Support</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Need help with an existing order? Contact us with your order number so we can assist you faster.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF6F0] space-y-2 border border-[#EFE6D8]">
              <div className="flex items-center space-x-2 font-bold text-neutral-900 text-sm">
                <MessageSquare className="w-4 h-4 text-[#B38548]" />
                <span>Product Enquiries</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Have questions about product availability, sizes, colours or other details? Send us your enquiry.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF6F0] space-y-2 border border-[#EFE6D8]">
              <div className="flex items-center space-x-2 font-bold text-neutral-900 text-sm">
                <Truck className="w-4 h-4 text-[#B38548]" />
                <span>Shipping & Delivery</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Need help tracking your order or understanding delivery timelines? We're here to help.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF6F0] space-y-2 border border-[#EFE6D8]">
              <div className="flex items-center space-x-2 font-bold text-neutral-900 text-sm">
                <RotateCcw className="w-4 h-4 text-[#B38548]" />
                <span>Returns & Refunds</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                For questions regarding returns, exchanges or refunds, please reach out to our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Commitment Notice */}
        <div className="bg-[#FAF4EB] p-6 rounded-3xl border border-[#EFE6D8] text-center space-y-2">
          <h4 className="font-serif text-lg font-bold text-neutral-900">Customer Support Commitment</h4>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-xl mx-auto">
            For faster assistance, please include your order number when contacting us about an existing order. We're committed to providing a smooth and reliable shopping experience at Femmeera.
          </p>
        </div>

      </div>
    </div>
  );
}
