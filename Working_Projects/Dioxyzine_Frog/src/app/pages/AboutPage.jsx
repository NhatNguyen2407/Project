import { motion } from 'motion/react';
import { Heart, Sparkles, Users, Award, Mail, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-[var(--burgundy)] to-[var(--dusty-pink)] overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About DIFR Studio
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              We're a creative studio specializing in custom handmade merchandise and plushies,
              bringing your characters and ideas to life with craftsmanship and care.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded by independent artists and makers, DIFR Studio was born from a passion
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
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop"
                  alt="DIFR Studio Workshop"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[var(--pastel-lavender)]/30 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -right-6 w-40 h-40 bg-[var(--dusty-pink)]/30 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-white to-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
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
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--dusty-pink)] to-[var(--burgundy)] flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[var(--cream)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
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
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[var(--cream)]/50 transition-colors"
                >
                  <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <svg
                      className="w-6 h-6 text-[var(--burgundy)]"
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

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              We'd love to hear about your project
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mail className="w-6 h-6" />,
                title: 'Email Us',
                content: 'hello@difr.studio',
                link: 'mailto:hello@difr.studio',
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: 'Visit Us',
                content: 'Tokyo, Japan',
                link: null,
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'Business Hours',
                content: 'Mon-Fri: 9AM-6PM JST',
                link: null,
              },
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-[var(--cream)] rounded-3xl p-8 shadow-lg text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--dusty-pink)] to-[var(--burgundy)] flex items-center justify-center text-white mx-auto mb-4">
                  {contact.icon}
                </div>
                <h3 className="font-semibold mb-2">{contact.title}</h3>
                {contact.link ? (
                  <a
                    href={contact.link}
                    className="text-muted-foreground hover:text-[var(--burgundy)] transition-colors"
                  >
                    {contact.content}
                  </a>
                ) : (
                  <p className="text-muted-foreground">{contact.content}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
