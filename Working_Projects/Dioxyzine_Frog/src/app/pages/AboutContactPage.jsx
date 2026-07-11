import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Users, Award, Mail, MapPin, Clock, Building2, ShieldCheck, HelpCircle, ChevronDown, CheckCircle2, Factory, PackageCheck } from 'lucide-react';

// import image
import jobsite_01 from '../../assets/Products/Banner/JobSite_01.jpg';

const processes = [
  { step: '01', title: 'Consultation', desc: 'We receive your 2D blueprints and listen to your dimensional properties.' },
  { step: '02', title: 'Quotation', desc: 'Transparent cost layouts. A deposit of 50% is required to initiate the patterning.' },
  { step: '03', title: 'Production Preview', desc: 'We print/embroider and send continuous photo adjustments for shape approval.' },
  { step: '04', title: 'Mass Production', desc: 'Our skilled artisans handcraft and sew the entire order.' },
  { step: '05', title: 'Quality Control', desc: 'Every single product is inspected for loose threads and expressions alignment before packing.' },
  { step: '06', title: 'Global Delivery', desc: 'Carefully packed, tracking codes applied, shipped domestically and globally.' }
];

const values = [
  { icon: <Heart className="w-8 h-8" />, title: 'Crafted with Love', desc: 'Every product is handmade with care and attention to detail.' },
  { icon: <Sparkles className="w-8 h-8" />, title: 'Creative Freedom', desc: 'No cookie-cutter solutions—your vision, your way.' },
  { icon: <Users className="w-8 h-8" />, title: 'Creator-First', desc: 'Built by creators, for creators and small businesses.' },
  { icon: <Award className="w-8 h-8" />, title: 'Quality Guaranteed', desc: 'Premium materials and rigorous quality control.' }
];

const faqs = [
  { question: 'What is your minimum order quantity (MOQ)?', answer: 'We support production from 11 pieces/model for listed products, and 30 pieces/model for completely custom layouts. We occasionally open slots for 1 piece/model orders on our social media, stay tuned!' },
  { question: 'How long does production take?', answer: 'Average production time is 2 to 6 weeks after design finalization. Large volume orders may require more time.' },
  // { question: 'Do you provide samples before full production?', answer: 'Yes! We always provide digital mockups and can create physical samples for an additional fee. We want to ensure you love the product before we start mass production.' },
  { question: 'What file formats do you accept for designs?', answer: 'We accept PNG, JPG, PDF, AI, and PSD files. High-resolution images work best. If you only have sketches or low-res images, our design team can help refine them.' },
  { question: 'Can I make changes after receiving a quote?', answer: 'Absolutely! Quotes are flexible until production begins. We encourage collaboration and will work with you to adjust specifications, materials, or quantities as needed.' },
  { question: 'Do you ship internationally?', answer: 'Yes, we provide Worldwide Shipping to all destination countries. Shipping costs and timelines vary by location, and international orders may be subject to customs duties.' },
  { question: 'What if I do not have a ready-to-print artwork and only have an idea or character in mind?', answer: 'We can provide with a design customized based on your idea/character for an additional fee of $5, and you can use this design for commercial purposes and reuse it for future orders.' }
];

export function AboutContactPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      
      {/* 1. HERO BANNER */}
      <section className="relative py-24 bg-gradient-to-br from-[#2C2144] via-[#08080C] to-[#171226] border-b border-[var(--border)] text-center">
        <div className="max-w-4xl mx-auto px-4 z-10">
          <h1 className="font-heading text-5xl md:text-6xl mb-6 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">About Dioxyzine Frog</h1>
          <p className="text-xl text-[var(--silver-gray)] leading-relaxed max-w-2xl mx-auto">
            Production workshop and design studio specializing in fan merch, custom merchandise, and exclusive handmade fabric gifts. Bringing the best prices to artists and brands.
          </p>
        </div>
      </section>

      {/* 2. SOCIAL SECTION */}
      <section className="py-12 bg-[#09090B] border-b border-[var(--border)] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6 font-heading tracking-wide">Follow us now on:</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://facebook.com/dioxyzinefrog" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-10 py-4 rounded-full bg-[#1877F2] text-white font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_15px_rgba(24,119,242,0.4)] min-w-[160px]">
              Facebook
            </a>
            <a href="https://instagram.com/dioxyzinefrog.print" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-10 py-4 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_15px_rgba(221,42,123,0.4)] min-w-[160px]">
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* 3. OUR STORY */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-heading text-4xl mb-6 text-white drop-shadow-[0_0_10px_rgba(139,114,190,0.3)]">Our Creative Story</h2>
            <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed text-lg">
              <p>Founded by an independent artist, Dioxyzine Frog was born from a passion for 2D characters and the desire to bring them to life. We deeply understand the difficulties creators face finding a reliable tailor who understands your vision without requiring thousands of pieces.</p>
              <p>Our mission is: Democratize high-end custom plushie making, bringing production closer to all creators and businesses. Whether you want a few for unique gifts or mass production for commercialization, we will try our best to make it come true.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--border)] shadow-[0_0_30px_rgba(139,114,190,0.2)]">
            <img 
              src={jobsite_01} 
              alt="Dioxyzine Story" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-500" 
            />
          </motion.div>
        </div>
      </section>

      {/* 4. TRUST FACTORS: PRODUCTION & QC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-lg">
            <div className="w-14 h-14 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center mb-6 border border-[var(--primary)]/50">
              <Factory className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">In-House Production</h3>
            <p className="text-[var(--silver-gray)] text-sm leading-relaxed mb-4">
              We own the entire production line from digital embroidery, fabric cutting, sewing, to stuffing. This ensures rapid prototyping and strictly controlled timelines.
            </p>
            <ul className="space-y-2 text-sm text-[var(--silver-gray)]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Advanced Embroidery Machines</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Experienced Tailor Team</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-lg">
            <div className="w-14 h-14 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center mb-6 border border-[var(--primary)]/50">
              <ShieldCheck className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">100% Quality Control</h3>
            <p className="text-[var(--silver-gray)] text-sm leading-relaxed mb-4">
              Every single plushie undergoes a rigorous 3-step QC process before shipping. We check for seam strength, embroidery accuracy, and overall shape symmetry.
            </p>
            <ul className="space-y-2 text-sm text-[var(--silver-gray)]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Thread & Seam Inspection</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Premium Velboa Fabric Only</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-lg">
            <div className="w-14 h-14 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center mb-6 border border-[var(--primary)]/50">
              <PackageCheck className="w-7 h-7 text-[var(--primary)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">B2B & White Label</h3>
            <p className="text-[var(--silver-gray)] text-sm leading-relaxed mb-4">
              We empower your brand. Ship your products directly to your customers with blind packaging. We act as your silent, reliable back-end factory.
            </p>
            <ul className="space-y-2 text-sm text-[var(--silver-gray)]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> No Invoices or Logos Attached</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Custom Tags Available</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 5. VALUES SECTION (Lấy từ AboutPage) */}
      <section className="py-24 bg-[#09090B] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-heading text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#130D1E] rounded-3xl p-8 border border-[var(--border)] shadow-lg hover:shadow-[0_0_20px_rgba(139,114,190,0.3)] transition-all text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#1A1528] border border-[var(--border)] group-hover:border-[var(--primary)] flex items-center justify-center text-[var(--primary)] mx-auto mb-4 transition-colors">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{value.title}</h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRODUCTION PROCESS */}
      <section className="py-24 bg-transparent border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">Our Production Process</h2>
            <p className="text-lg text-[var(--muted-foreground)]">A structured, transparent, and collaborative workflow</p>
          </div>
          <div className="space-y-6">
            {processes.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-md hover:shadow-[0_0_15px_rgba(139,114,190,0.1)] transition-shadow"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#1A1528] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-2xl font-heading shadow-[0_0_10px_rgba(139,114,190,0.2)]">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-[var(--silver-gray)] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="py-24 bg-[#09090B] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl mb-4 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">Frequently Asked Questions</h2>
            <p className="text-lg text-[var(--muted-foreground)]">Everything you need to know about working with our workshop</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#130D1E] border border-[var(--border)] rounded-2xl overflow-hidden shadow-md">
                <button onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[#1A1528] transition-colors cursor-pointer">
                  <h3 className="font-semibold text-lg pr-4 text-white">{faq.question}</h3>
                  <span className={`text-[var(--primary)] text-2xl font-bold transition-transform duration-300 ${openFaqIndex === index ? 'rotate-45' : 'rotate-0'}`}>+</span>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-6 pb-5 text-[var(--silver-gray)] leading-relaxed border-t border-[var(--border)]/30 pt-4 font-medium">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CONTACT INFO */}
      <section className="py-24 bg-transparent text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-4xl mb-12 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] transition-shadow">
              <Mail className="w-10 h-10 text-[var(--primary)] mx-auto mb-4 drop-shadow-[0_0_10px_rgba(139,114,190,0.5)]" />
              <h3 className="font-bold mb-2 text-white text-lg">Email</h3>
              <a href="mailto:dioxyzinefrog@gmail.com" className="text-[var(--primary)] font-medium hover:underline">dioxyzinefrog@gmail.com</a>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] transition-shadow">
              <MapPin className="w-10 h-10 text-[var(--primary)] mx-auto mb-4 drop-shadow-[0_0_10px_rgba(139,114,190,0.5)]" />
              <h3 className="font-bold mb-2 text-white text-lg">Location</h3>
              <p className="font-medium text-[var(--muted-foreground)]">Hanoi, Vietnam</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 flex flex-col items-center justify-center hover:shadow-[0_0_20px_rgba(139,114,190,0.2)] transition-shadow">
              <Clock className="w-10 h-10 text-[var(--primary)] mx-auto mb-4 drop-shadow-[0_0_10px_rgba(139,114,190,0.5)]" />
              <h3 className="font-bold mb-2 text-white text-lg">Business Hours</h3>
              <p className="font-medium text-[var(--muted-foreground)]">Mon - Sat: 10:00 AM - 10:00 PM (GMT+7)</p>
              <p className="text-sm text-[var(--silver-gray)] italic mt-1">Sun: Flexible (Online when available)</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}