import { motion } from 'motion/react';
import { Heart, Sparkles, Users, Award, Mail, MapPin, Clock, Instagram, Twitter } from 'lucide-react';
import { useState } from 'react';
import { InquiryForm } from '../components/InquiryForm';

const faqs = [
  {
    question: 'What is your minimum order quantity (MOQ)?',
    answer:
      'Our MOQ varies by product type. For custom plushies, we typically start at 10 pieces, while accessories like pins and keychains may have higher MOQs (50-100 pieces). Contact us for specific product requirements.',
  },
  {
    question: 'How long does production take?',
    answer:
      'Standard production time is 2-4 weeks after design approval. Rush orders may be available for an additional fee. Complex designs or larger quantities may require additional time.',
  },
  {
    question: 'Do you provide samples before full production?',
    answer:
      'Yes! We always provide digital mockups and can create physical samples for an additional fee. We want to ensure you love the product before we start mass production.',
  },
  {
    question: 'What file formats do you accept for designs?',
    answer:
      'We accept PNG, JPG, PDF, AI, and PSD files. High-resolution images work best. If you only have sketches or low-res images, our design team can help refine them.',
  },
  {
    question: 'Can I make changes after receiving a quote?',
    answer:
      'Absolutely! Quotes are flexible until production begins. We encourage collaboration and will work with you to adjust specifications, materials, or quantities as needed.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes, we ship worldwide! Shipping costs and timelines vary by location. International orders may be subject to customs duties determined by the destination country.',
  },
];

export function AboutContactPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      {/* Hero Banner Tím/Đen Y2K */}
      <section className="relative py-24 bg-gradient-to-br from-[#2C2144] via-[#08080C] to-[#171226] border-b border-[var(--border)] overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-3xl mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2C2144]/40 rounded-full blur-3xl mix-blend-screen"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
              About Dioxyzine Frog
            </h1>
            <p className="text-xl text-[var(--silver-gray)] leading-relaxed max-w-2xl mx-auto">
              A creative studio specializing in custom handmade merchandise and plushies, bringing
              your characters and ideas to life with craftsmanship and care.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.3)]">Our Story</h2>
              <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed text-lg">
                <p>
                  Founded by independent artists and makers, Dioxyzine Frog was born from a passion
                  for bringing creative visions to life. We understand the challenges creators
                  face when trying to produce high-quality merchandise without massive upfront
                  costs or unreasonable minimum orders.
                </p>
                <p>
                  Our mission is simple: make custom merchandise accessible, affordable, and
                  delightful. Whether you're an independent artist, content creator, or small
                  business, we're here to transform your designs into tangible products that
                  your audience will love.
                </p>
                <p>
                  Every plushie, pin, and piece of merchandise is crafted with meticulous
                  attention to detail, ensuring that what you envision is exactly what you
                  receive. We're not just manufacturers—we're collaborators in your creative
                  journey.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(139,114,190,0.2)] border border-[var(--border)]">
                <img
                  src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop"
                  alt="Dioxyzine Frog Workshop"
                  className="w-full h-auto opacity-80"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-[#09090B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.3)]">Our Philosophy</h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Creating with intention, crafting with care
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8" />,
                title: 'Crafted with Love',
                description: 'Every product is handmade with care and attention to detail',
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: 'Creative Freedom',
                description: 'No cookie-cutter solutions—your vision, your way',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Creator-First',
                description: 'Built by creators, for creators and small businesses',
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Quality Guaranteed',
                description: 'Premium materials and rigorous quality control',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--card)] rounded-3xl p-8 shadow-lg border border-[var(--border)] text-center hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] transition-shadow"
              >
                <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{value.title}</h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Production Workflow */}
      <section className="py-24 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.3)]">Our Production Process</h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              From concept to creation, every step is carefully managed
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Initial Consultation', description: 'We discuss your vision, review references, and understand your requirements.' },
              { step: '02', title: 'Design & Quote', description: 'Our team creates detailed mockups and provides transparent pricing.' },
              { step: '03', title: 'Sample Approval', description: 'We produce physical samples for your review before mass production.' },
              { step: '04', title: 'Production', description: 'Skilled artisans handcraft each piece with premium materials.' },
              { step: '05', title: 'Quality Control', description: 'Every item undergoes rigorous inspection to ensure it meets expectations.' },
              { step: '06', title: 'Delivery', description: 'Your products are carefully packaged and shipped with tracking worldwide.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md hover:shadow-[0_0_15px_rgba(139,114,190,0.2)] transition-shadow"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-xl">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.3)]">Frequently Asked Questions</h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Everything you need to know about working with us
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#09090B] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[var(--primary)]/10 transition-colors"
                >
                  <h3 className="font-semibold text-lg pr-4 text-white">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaqIndex === index ? 'auto' : 0, opacity: openFaqIndex === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-[var(--muted-foreground)] leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.3)]">Get in Touch</h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              We're here to answer your questions and bring your ideas to life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: <Mail className="w-6 h-6" />, title: 'Email Us', content: 'dioxyzine.frog@gmail.com', subContent: 'Response within 24 hours', link: 'mailto:dioxyzine.frog@gmail.com' },
              { icon: <MapPin className="w-6 h-6" />, title: 'Studio Location', content: 'Vietnam', subContent: 'Serving clients worldwide', link: null },
              { icon: <Clock className="w-6 h-6" />, title: 'Business Hours', content: 'Mon-Fri: 9AM-6PM', subContent: 'Weekend inquiries welcome', link: null },
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-lg text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mx-auto mb-4">
                  {contact.icon}
                </div>
                <h3 className="font-semibold mb-2 text-white">{contact.title}</h3>
                {contact.link ? (
                  <a href={contact.link} className="text-[var(--primary)] hover:text-white transition-colors font-medium">
                    {contact.content}
                  </a>
                ) : (
                  <p className="font-medium text-white">{contact.content}</p>
                )}
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{contact.subContent}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="py-24 bg-[#09090B] border-t border-[var(--border)] relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-[0_0_8px_rgba(139,114,190,0.3)]">Business Inquiry</h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              Ready to start your project? Fill out the form below and we'll get back to you with a detailed quote
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <InquiryForm />
          </motion.div>
        </div>
      </section>
    </div>
  );
}