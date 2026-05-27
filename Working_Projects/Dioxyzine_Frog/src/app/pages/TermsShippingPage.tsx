import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: `Welcome to DIFR Studio. These Terms of Service govern your use of our custom merchandise manufacturing services. By placing an order with us, you agree to be bound by these terms. Please read them carefully before proceeding with any inquiry or order.`,
  },
  {
    id: 'ordering',
    title: 'Ordering Process',
    content: `All orders begin with an inquiry submission through our website or email. Once we receive your inquiry, our team will review your requirements and provide a detailed quote within 24 hours. The quote will include pricing, production timeline, and any additional specifications. Orders are confirmed only after you approve the quote and provide necessary design files.`,
  },
  {
    id: 'custom-policy',
    title: 'Custom Product Policy',
    content: `As all our products are custom-made to order, we require clear communication about your design requirements. You are responsible for providing high-quality design files, color specifications, and any reference materials. Our design team can assist with refinements, but significant design work may incur additional fees. All custom products are made specifically for you and cannot be resold to other customers.`,
  },
  {
    id: 'payment',
    title: 'Payment Terms',
    content: `Payment is typically structured as follows: 50% deposit upon order confirmation and 50% balance before shipping. We accept bank transfers, PayPal, and major credit cards. Payment must be received before production begins. For large orders exceeding $5,000, custom payment terms may be arranged. All prices are quoted in USD unless otherwise specified.`,
  },
  {
    id: 'revisions',
    title: 'Revision Policy',
    content: `We offer up to 2 rounds of revisions on digital mockups at no additional cost. Additional revision rounds may incur fees depending on the complexity. Once you approve the sample and production begins, changes cannot be made. Physical samples can be produced for an additional fee before mass production. We highly recommend approving physical samples for orders over 100 pieces.`,
  },
  {
    id: 'refunds',
    title: 'Refund & Cancellation Policy',
    content: `Due to the custom nature of our products, cancellations are only accepted before production begins. If you cancel after paying the deposit but before production starts, a 20% administrative fee will be deducted from your refund. Once production has started, cancellations are not accepted and deposits are non-refundable. If we cannot fulfill your order due to circumstances beyond your control, a full refund will be issued.`,
  },
  {
    id: 'timeline',
    title: 'Production Timeline',
    content: `Standard production time is 2-4 weeks after design approval and deposit payment. Complex designs, large quantities, or special materials may require additional time. Rush production is available for certain products at an additional cost (typically 30-50% surcharge). Production timelines are estimates and may vary due to material availability, factory schedules, or unforeseen circumstances.`,
  },
  {
    id: 'shipping',
    title: 'International Shipping',
    content: `We ship worldwide via DHL, FedEx, or EMS depending on your location and package size. Shipping costs are calculated based on weight, dimensions, and destination. Typical delivery times: Asia (3-5 days), North America (5-7 days), Europe (7-10 days), other regions (10-14 days). All shipments include tracking information. Signature may be required upon delivery for high-value orders.`,
  },
  {
    id: 'customs',
    title: 'Customs & Import Taxes',
    content: `International customers are responsible for all customs duties, taxes, and import fees charged by their country. These fees are not included in our quoted prices and are payable directly to the shipping carrier or customs office. We mark all packages with accurate values for customs declarations. DIFR Studio is not responsible for delays or additional charges related to customs processing.`,
  },
  {
    id: 'delivery',
    title: 'Delivery Estimates',
    content: `Delivery dates are estimates only and are not guaranteed. Delays may occur due to customs processing, weather conditions, carrier issues, or other factors beyond our control. We will provide tracking information once your order ships. If you have a strict deadline, please inform us during the inquiry stage so we can plan accordingly.`,
  },
  {
    id: 'damaged',
    title: 'Lost or Damaged Packages',
    content: `While rare, packages may be damaged during transit. Please inspect your order upon delivery and report any damage within 48 hours with photographic evidence. We will work with the shipping carrier to file a claim. For lost packages, please contact us if tracking shows no movement for 10+ days. All shipments are insured, and we will reship or refund orders confirmed as lost or damaged.`,
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property Policy',
    content: `You retain all rights to your original designs and characters. By submitting designs to us, you grant DIFR Studio permission to manufacture products based on those designs for you. We will not reproduce or sell your designs to third parties without explicit written permission. You are responsible for ensuring you have the legal right to produce any designs you submit (e.g., no copyright infringement of existing characters).`,
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    content: `We collect personal information (name, email, address) solely for order fulfillment purposes. Your information will never be sold or shared with third parties except as necessary for production and shipping (e.g., manufacturers, carriers). We use industry-standard security measures to protect your data. Design files are kept confidential and deleted after project completion unless you request otherwise.`,
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: `For questions about these terms or any aspect of our service, please contact us at hello@difr.studio or through our website inquiry form. Our business hours are Monday-Friday, 9AM-6PM JST. We aim to respond to all inquiries within 24 hours during business days.`,
  },
];

export function TermsShippingPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(scrolled);

      // Update active section based on scroll position
      const sectionElements = sections.map((section) =>
        document.getElementById(section.id)
      );
      const currentSection = sectionElements.find((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          style={{ width: `${scrollProgress}%` }}
          className="h-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                On This Page
              </h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === section.id
                        ? 'bg-[var(--dusty-pink)]/10 text-[var(--burgundy)] font-medium'
                        : 'text-muted-foreground hover:text-[var(--burgundy)] hover:bg-[var(--cream)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {activeSection === section.id && (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className={activeSection !== section.id ? 'ml-6' : ''}>
                        {section.title}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
                Terms of Service & Shipping
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Last updated: May 27, 2026
              </p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-16">
              {sections.map((section, index) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="scroll-mt-32"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--dusty-pink)] to-[var(--burgundy)] text-white font-semibold text-sm">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <h2 className="text-3xl font-bold">{section.title}</h2>
                  </div>
                  <div className="ml-14">
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                  {index < sections.length - 1 && (
                    <div className="mt-8 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  )}
                </motion.section>
              ))}
            </div>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-24 p-12 rounded-3xl bg-gradient-to-br from-[var(--burgundy)] to-[var(--dusty-pink)] text-white text-center"
            >
              <h3 className="text-3xl font-bold mb-4">Have Questions?</h3>
              <p className="text-lg mb-8 opacity-90">
                Our team is here to help clarify any policies or answer your concerns
              </p>
              <a href="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-white text-[var(--burgundy)] font-semibold shadow-xl hover:shadow-2xl transition-shadow"
                >
                  Contact Us
                </motion.button>
              </a>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Mobile Section Navigation */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-white rounded-2xl shadow-2xl border border-border p-4">
          <select
            value={activeSection}
            onChange={(e) => scrollToSection(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)]"
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
