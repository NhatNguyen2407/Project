import { motion } from 'motion/react';
import { Heart, Sparkles, Users, Award, Mail, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

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

const faqs = [
  { question: 'What is your minimum order quantity (MOQ)?', answer: 'We support production from 10 pieces/model for listed products, and 30 pieces/model for completely custom layouts. We occasionally open slots for 1 piece/model orders on our social media, stay tuned!' },
  { question: 'How long does production take?', answer: 'Average production time is 2 to 6 weeks after design finalization. Large volume orders may require more time.' },
  { question: 'Do we ship internationally?', answer: 'Yes, we provide Worldwide Shipping to all destination countries.' }
];

export function AboutContactPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      {/* Hero Banner */}
      <section className="relative py-24 bg-gradient-to-br from-[#2C2144] via-[#08080C] to-[#171226] border-b border-[var(--border)] text-center">
        <div className="max-w-4xl mx-auto px-4 z-10">
          <h1 className="font-heading text-5xl md:text-6xl mb-6 text-white">About Dioxyzine Frog</h1>
          <p className="text-xl text-[var(--silver-gray)] leading-relaxed max-w-2xl mx-auto">
            Production workshop and design studio specializing in fan merch, merchandise custom, and exclusive handmade fabric gifts. Bringing the best prices to artists and brands.
          </p>
        </div>
      </section>

      {/* SOCIAL SECTION - Đã xóa icon, giữ khung màu */}
      <section className="py-12 bg-[#09090B] border-b border-[var(--border)] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6 font-heading tracking-wide">Follow us now on:</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://facebook.com/dioxyzinefrog" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-10 py-4 rounded-full bg-[#1877F2] text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg min-w-[160px]">
              Facebook
            </a>
            <a href="https://instagram.com/dioxyzinefrog.print" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-10 py-4 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg min-w-[160px]">
              Instagram
            </a>
            <a href="https://www.threads.net/@dioxyzinefrog.print" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-10 py-4 rounded-full bg-[#101010] text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg border border-white/20 min-w-[160px]">
              Threads
            </a>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading text-4xl mb-6 text-white">Our Creative Story</h2>
            <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed text-lg">
              <p>Founded by an independent artist, Dioxyzine Frog was born from a passion for 2D characters and the desire to bring them to life. We deeply understand the difficulties creators face finding a reliable tailor who understands your vision without requiring thousands of pieces.</p>
              <p>Our mission is: Democratize high-end custom plushie making, bringing production closer to all creators and businesses. Whether you want a few for unique gifts or mass production for commercialization, we will try our best to make it come true.</p>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--border)] shadow-lg">
            <img 
              src={jobsite_01} 
              alt="Dioxyzine Story" 
              className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300" 
            />
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-24 bg-transparent border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl mb-4 text-white">Our Production Process</h2>
            <p className="text-lg text-[var(--muted-foreground)]">A structured, transparent, and collaborative workflow</p>
          </div>
          <div className="space-y-6">
            {processes.map((item, index) => (
              <div key={index} className="flex gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-xl">{item.step}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#09090B] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-lg text-[var(--muted-foreground)]">Everything you need to know about working with our workshop</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#130D1E] border border-[var(--border)] rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[var(--primary)]/10 cursor-pointer">
                  <h3 className="font-semibold text-lg pr-4 text-white">{faq.question}</h3>
                  <span className="text-[var(--primary)] text-2xl font-bold">{openFaqIndex === index ? '−' : '+'}</span>
                </button>
                {openFaqIndex === index && (
                  <p className="px-6 pb-5 text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)]/30 pt-4 font-medium">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section className="py-24 bg-transparent text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-4xl mb-12 text-white">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8">
              <Mail className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">Email</h3>
              <a href="mailto:dioxyzinefrog@gmail.com" className="text-[var(--primary)] font-medium">dioxyzinefrog@gmail.com</a>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8">
              <MapPin className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">Location</h3>
              <p className="font-medium text-[var(--muted-foreground)]">Hanoi, Vietnam</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 flex flex-col items-center justify-center">
              <Clock className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">Business Hours</h3>
              <p className="font-medium text-[var(--muted-foreground)]">Mon - Sat: 10:00 AM - 10:00 PM</p>
              <p className="text-sm text-[var(--silver-gray)] italic mt-1">Sun: Flexible (Online when available)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}