import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, HelpCircle, ShoppingBag, CreditCard, Truck, RotateCcw, Mail, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Femmeera",
  description: "Find answers to common questions about Femmeera women's traditional and western clothing, orders, payments, shipping, returns, refunds and more.",
};

const faqs = [
  {
    category: "General",
    icon: HelpCircle,
    items: [
      {
        q: "What is Femmeera?",
        a: "Femmeera is an online fashion store offering a curated collection of women's clothing, including traditional Indian wear and modern western wear. We aim to make stylish and quality fashion accessible through a convenient online shopping experience.",
      },
      {
        q: "What types of clothing does Femmeera offer?",
        a: "Femmeera currently offers two main categories:\n• Traditional Wear for Women (Sarees, Lehengas, Suits, Kurtis)\n• Western Wear for Women (Dresses, Co-ord Sets, Tops, Partywear)\n\nOur collections include different styles, designs and outfits suitable for everyday wear, celebrations, festivals, parties and special occasions.",
      },
    ],
  },
  {
    category: "Orders & Payments",
    icon: CreditCard,
    items: [
      {
        q: "How can I place an order?",
        a: "Browse our products, select your preferred item and size, add it to your cart, and proceed to checkout. Enter your delivery information and complete the payment using one of the available payment methods.",
      },
      {
        q: "What payment methods are available?",
        a: "Depending on availability, Femmeera supports:\n• UPI & Instant Wallet Transfer (Google Pay, PhonePe, Paytm)\n• Credit Cards & Debit Cards (Visa, Mastercard, RuPay)\n• Cash on Delivery (COD)\n\nAll online payments are processed through secure payment infrastructure.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Cash on Delivery (COD) is available for selected products and delivery locations across India. Availability will be automatically displayed during checkout.",
      },
      {
        q: "How can I check my order status?",
        a: "After placing an order, you can log in to your Femmeera account and visit 'My Orders' to view real-time order status and live courier tracking information.",
      },
      {
        q: "Can I cancel my order?",
        a: "Order cancellation depends on the current status of the order. Orders that have already been processed or dispatched may not be eligible for cancellation. Please refer to our Return Policy for complete details.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    icon: Truck,
    items: [
      {
        q: "How long does delivery take?",
        a: "Delivery time depends on the product, delivery location, availability and shipping method. Standard dispatch takes 1-2 business days, and estimated delivery periods (3-7 days) are displayed during checkout.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    icon: RotateCcw,
    items: [
      {
        q: "Can I return a product?",
        a: "Return eligibility depends on the product and the applicable return policy. Products must generally meet required return conditions (unused, unwashed, original tags intact). Please review our Return Policy before requesting a return.",
      },
      {
        q: "How do I request a return?",
        a: "Log in to your Femmeera account, open 'My Orders', select the relevant order and click 'Request Return' to follow the quick return process.",
      },
      {
        q: "When will I receive my refund?",
        a: "Once an eligible return has been received and inspected at our warehouse, the refund will be processed to your original payment method or bank account within 5-7 business days.",
      },
    ],
  },
  {
    category: "Customer Support",
    icon: Mail,
    items: [
      {
        q: "How can I contact Femmeera?",
        a: "For questions regarding orders, products, shipping or returns, visit our Contact Us page or email us directly at myfemmeera@gmail.com.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Navigation */}
        <Link href="/" className="inline-flex items-center text-xs font-bold text-neutral-500 hover:text-[#B38548] gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-3 border-b border-[#EFE6D8] pb-8">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#B38548] uppercase">
            HELP CENTER & SUPPORT
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-neutral-900">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            Find quick answers to common questions about Femmeera orders, shipping, payments, returns, and products.
          </p>
        </div>

        {/* Category Blocks */}
        <div className="space-y-8">
          {faqs.map((group, gIdx) => {
            const Icon = group.icon;
            return (
              <div key={gIdx} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE6D8] shadow-xs space-y-6">
                <div className="flex items-center space-x-3 border-b border-[#F5EFE6] pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF4EB] text-[#B38548] flex items-center justify-center border border-[#EFE5D5]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-xl font-medium text-neutral-900">
                    {group.category}
                  </h2>
                </div>

                <div className="space-y-6 divide-y divide-[#F5EFE6]">
                  {group.items.map((faq, iIdx) => (
                    <div key={iIdx} className={iIdx > 0 ? "pt-5 space-y-2" : "space-y-2"}>
                      <h3 className="text-sm font-bold text-neutral-900 flex items-start space-x-2">
                        <span className="text-[#B38548] font-mono">Q.</span>
                        <span>{faq.q}</span>
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed pl-6 whitespace-pre-line">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="bg-[#FAF4EB] p-8 rounded-3xl border border-[#EFE6D8] text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-neutral-900">
            Still Have Questions?
          </h3>
          <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
            Can't find the answer you're looking for? Our customer support team is always here to assist you.
          </p>
          <div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#B38548] hover:bg-[#966C32] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
