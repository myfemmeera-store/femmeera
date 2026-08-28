import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Femmeera',
  description: "Read Femmeera's terms and conditions covering online shopping, products, orders, payments, shipping, returns and website usage.",
};

const termsSections = [
  {
    num: "1",
    title: "Introduction",
    content: "Welcome to Femmeera. By accessing or using our website (femmeera.com), you agree to comply with and be bound by these Terms & Conditions. Please read them carefully before making a purchase.",
  },
  {
    num: "2",
    title: "Products",
    content: "We make reasonable efforts to display product descriptions, images, colours, sizes and prices accurately. However, slight variations in colour or appearance may occur due to device displays and photography lighting.",
  },
  {
    num: "3",
    title: "Product Availability",
    content: "Product availability may change based on inventory. Femmeera reserves the right to update product availability, stock levels, or discontinue items without prior notice.",
  },
  {
    num: "4",
    title: "Pricing",
    content: "Product prices displayed on the website are subject to change. Applicable taxes, shipping charges, discounts and promotional offers will be clearly displayed during checkout where applicable.",
  },
  {
    num: "5",
    title: "Orders",
    content: "After placing an order, you will receive an automated order confirmation via email. Femmeera reserves the right to cancel or reject an order in circumstances such as incorrect pricing, stock inventory issues, payment authorization failures, or suspected fraudulent activity.",
  },
  {
    num: "6",
    title: "Payments",
    content: "Online payments are processed through authorized payment gateways (UPI, Credit/Debit Cards, Net Banking) and Cash on Delivery (COD) where eligible. Customers are responsible for providing accurate billing information.",
  },
  {
    num: "7",
    title: "Shipping",
    content: "Delivery timelines may vary depending on product availability, destination address, courier service operational constraints, and weather conditions. Estimated delivery dates are displayed during checkout.",
  },
  {
    num: "8",
    title: "Returns & Refunds",
    content: "Returns, size exchanges, and refunds are governed by Femmeera's applicable Shipping & Returns Policy. Items returned must be unused, unwashed, and in original brand condition with all tags intact.",
  },
  {
    num: "9",
    title: "User Accounts",
    content: "Customers are responsible for maintaining the confidentiality of their account credentials (password and OTP) and for all activities performed under their registered account.",
  },
  {
    num: "10",
    title: "Website Usage",
    content: "Users must not misuse the website, attempt unauthorized access to server infrastructure, interfere with site functionality, or use the website for any unlawful purposes.",
  },
  {
    num: "11",
    title: "Intellectual Property",
    content: "All website content including the Femmeera brand name, logos, product photography, text descriptions, graphics, and UI design are protected by applicable intellectual property laws and may not be reproduced without written permission.",
  },
  {
    num: "12",
    title: "Changes to Terms",
    content: "Femmeera may update or modify these Terms & Conditions from time to time. Updated terms will be effective immediately upon publication on this page.",
  },
  {
    num: "13",
    title: "Contact Information",
    content: "For any questions or clarification regarding these Terms & Conditions, please contact Femmeera through our Contact Us page or email us at myfemmeera@gmail.com.",
  },
];

export default function TermsPage() {
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
            LEGAL & COMPLIANCE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-neutral-900">
            Terms & Conditions
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Read Femmeera's terms and conditions covering online shopping, products, orders, payments, shipping, returns and website usage.
          </p>
        </div>

        {/* Terms Accordion/List Cards */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EFE6D8] shadow-xs space-y-8">
          {termsSections.map((section) => (
            <div key={section.num} className="space-y-2 border-b border-[#F5EFE6] pb-6 last:border-0 last:pb-0">
              <h2 className="font-serif text-lg font-bold text-neutral-900 flex items-center space-x-2">
                <span className="text-[#B38548] font-mono text-sm font-bold">{section.num}.</span>
                <span>{section.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pl-6">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Footer Note */}
        <div className="bg-[#FAF4EB] p-6 rounded-3xl border border-[#EFE6D8] text-center space-y-2 text-xs text-neutral-600">
          <p>
            Questions about our Terms & Conditions? Contact us at <a href="mailto:myfemmeera@gmail.com" className="font-bold text-[#B38548] underline">myfemmeera@gmail.com</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
