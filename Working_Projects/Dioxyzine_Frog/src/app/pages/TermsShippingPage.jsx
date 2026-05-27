import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: `Welcome to Dioxyzine Frog. These Terms of Service govern your use of our custom merchandise manufacturing services.`,
  },
  {
    id: 'ordering',
    title: 'Ordering Process',
    content: `All orders begin with an inquiry submission through our website or email. Once we receive your inquiry, our team will review your requirements and provide a detailed quote.`,
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

  const scrollToSection = (id) => {
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
    <div className="min-h-screen pt-24 pb-16 bg-background relative z-10">
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#130D1E] z-50">
        <motion.div
          style={{ width: `${scrollProgress}%` }}
          className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
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
                        ? 'bg-[var(--primary)]/20 text-white font-medium border border-[var(--primary)]/50'
                        : 'text-muted-foreground hover:text-white hover:bg-[#130D1E]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {activeSection === section.id && (
                        <ChevronRight className="w-4 h-4 flex-shrink-0 text-[var(--primary)]" />
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

          <main className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Terms of Service & Shipping
              </h1>
            </motion.div>

            <div className="space-y-16">
              {sections.map((section, index) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="scroll-mt-32"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                  </div>
                  <div className="ml-4">
                    <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </motion.section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}