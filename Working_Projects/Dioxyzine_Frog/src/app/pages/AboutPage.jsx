import { motion } from 'motion/react';
import { Heart, Sparkles, Users, Award, Mail, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

import jobsite_01 from '../../assets/Products/Banner/JobSite_01.jpg'

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

export function AboutPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded by independent artists and makers, Dioxyzine Frog was born from a passion
                  for bringing creative visions to life. We understand the challenges creators
                  face when trying to produce high-quality merchandise without massive upfront
                  costs or unreasonable minimum orders.
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
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)]">
                <img
                  src="../../assets/Products/Banner/JobSite_01.jpg"
                  alt="Dioxyzine Frog Workshop"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-background to-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              What We Stand For
            </h2>
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
                className="bg-[#130D1E] rounded-3xl p-8 border border-[var(--border)] shadow-lg hover:shadow-2xl transition-shadow text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[var(--muted)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
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
                className="bg-[#130D1E] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden"
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
                    <svg
                      className="w-6 h-6 text-[var(--primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaqIndex === index ? 'auto' : 0,
                    opacity: openFaqIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}